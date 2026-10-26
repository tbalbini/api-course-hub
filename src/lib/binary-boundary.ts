import { modelStep } from "./communication";
import { interaction } from "./interaction";
import { indexEvents, type Capture, type TraceEvent } from "./trace";

export interface BinarySettings { mechanism: "abi" | "wasm"; left: number; right: number; swapped: boolean; released: boolean }
export const defaultBinary: BinarySettings = { mechanism: "abi", left: 10, right: 3, swapped: false, released: false };
export interface BinaryRun { settings: BinarySettings; bytes: number[]; expected: number | null; result: number | null; error: string | null; invoked: boolean; capture: Capture }
export const wasmText = '(module\n  (func (export "dividir") (param i32 i32) (result i32)\n    local.get 0\n    local.get 1\n    i32.div_s))';
export function wasmModuleBytes(): Uint8Array<ArrayBuffer> {
  return new Uint8Array([0,97,115,109,1,0,0,0,1,7,1,96,2,127,127,1,127,3,2,1,0,7,11,1,7,100,105,118,105,100,105,114,0,0,10,9,1,7,0,32,0,32,1,109,11]);
}
export function validateBinary(left: number, right: number) {
  if (![left, right].every(n => Number.isInteger(n) && n >= -1000 && n <= 1000)) throw new Error("Usa dos enteros entre −1000 y 1000.");
}
export function abiRun(options: BinarySettings): BinaryRun {
  const settings = { ...options }; validateBinary(settings.left, settings.right);
  const bytes = new Uint8Array(8), view = new DataView(bytes.buffer);
  view.setInt32(0, settings.left, true); view.setInt32(4, settings.right, true);
  const entries: TraceEvent[] = [
    modelStep("invokeLocal", "El consumidor prepara restar(a,b)", { a: settings.left, b: settings.right }, Array.from(bytes), "La API nombra argumentos; la convención binaria fija su representación y posición.", "browser", "restar(int32 a,int32 b):int32", "view.setInt32(0, a, true);\nview.setInt32(4, b, true);", "Convención de juguete: dos campos LE alineados a4 en8 bytes. No modela registros ni una ABI real de CPU.", interaction("Consumidor del modelo", "Binding del modelo", "Modelo ABI · int32 little endian", "Un cambio de layout puede interpretar otros valores.")),
  ];
  const check = modelStep("checkContract", "El binding comprueba la vida de la memoria", { released: settings.released }, null, "Un argumento con el formato correcto puede referirse a memoria que ya no es válida.", "browser", "El propietario mantiene el buffer vivo durante la llamada", "if (released) throw new Error('LIFETIME');", "Aquí se simula el estado de vida. No se accede a memoria nativa liberada. Un binding real debe definir ownership, copias y duración.", interaction("Binding del modelo", "Comprobación de lifetime", "Modelo FFI · ownership", "Usar memoria liberada rompe el contrato."));
  entries.push(check);
  let result: number | null = null, error: string | null = null;
  if (settings.released) { error = "LIFETIME"; check.state = "error"; check.error = { code: error, message: "Memoria liberada: se rechaza antes de invocar al proveedor." }; }
  else {
    const left = view.getInt32(settings.swapped ? 4 : 0, true), right = view.getInt32(settings.swapped ? 0 : 4, true);
    entries.push(modelStep("providerModel", "El proveedor interpreta los argumentos", Array.from(bytes), { left, right }, "Los mismos bytes cambian de significado si ambos lados no acuerdan los offsets.", "provider", settings.swapped ? "Proveedor lee a@4,b@0" : "Proveedor lee a@0,b@4", "const a = view.getInt32(aOffset, true);\nconst b = view.getInt32(bOffset, true);", "La inversión es deliberada y determinista en este modelo. Una incompatibilidad nativa real también podría provocar corrupción o un fallo del proceso.", interaction("Binding del modelo", "Función nativa modelada", "Modelo ABI · mismo proceso", "Layout o calling convention incompatibles.")));
    result = left - right;
    entries.push(modelStep("returnLocal", "La función devuelve el valor interpretado", { left, right }, result, "El proveedor usa los valores que leyó, aunque no sean los que quiso enviar el consumidor.", "provider", "return left - right", "return left - right;", "No se ejecutó C ni una biblioteca nativa. La API puede mantener el nombre y aun romper su contrato binario.", interaction("Función nativa modelada", "Consumidor del modelo", "Retorno ABI modelado")));
  }
  return { settings, bytes: Array.from(bytes), expected: settings.left - settings.right, result, error, invoked: !settings.released, capture: { id: "advanced:abi", mode: "simulation", events: indexEvents("advanced:abi", entries) } };
}

export async function wasmRun(options: BinarySettings): Promise<BinaryRun> {
  const settings = { ...options, mechanism: "wasm" as const }; validateBinary(settings.left, settings.right);
  const bytes = wasmModuleBytes(), entries: TraceEvent[] = [];
  const compile = modelStep("providerModel", "El navegador instancia el módulo fijo", { bytes: bytes.length }, null, "La API JavaScript de WebAssembly valida y prepara una instancia local.", "browser", "Módulo sin imports · export dividir(i32,i32):i32", "const { instance } = await WebAssembly.instantiate(bytes);", "Observación real del wrapper. No mide instrucciones, compilación interna ni JIT. Este módulo no exporta memoria ni tiene capacidades de red o archivos.", interaction("Wrapper JavaScript", "Runtime WebAssembly", "WebAssembly.instantiate · real", "Runtime no disponible o módulo no aceptado."));
  compile.provenance = "observed"; entries.push(compile);
  let result: number | null = null, error: string | null = null, invoked = false;
  try {
    if (typeof WebAssembly === "undefined") throw new Error("WASM_UNAVAILABLE");
    const { instance } = await WebAssembly.instantiate(bytes);
    const divide = instance.exports.dividir;
    if (typeof divide !== "function") throw new Error("WASM_EXPORT");
    compile.output = { export: "dividir", parameters: ["i32", "i32"], result: "i32" };
    const call = modelStep("invokeLocal", "JavaScript llama al export dividir", { a: settings.left, b: settings.right }, null, "Una interfaz tipada comunica JavaScript con el módulo sin una petición HTTP.", "browser", "dividir(i32,i32):i32", "const result = instance.exports.dividir(a, b);", "Los controles restringen los valores a enteros pequeños. i32.div_s trunca hacia cero y puede producir un trap. Una interfaz Wasm no es la ABI del sistema anfitrión.", interaction("Wrapper JavaScript", "Export dividir de Wasm", "WebAssembly · llamada local real", "División entera por cero produce RuntimeError."));
    call.provenance = "observed"; entries.push(call); invoked = true;
    const output: unknown = divide(settings.left, settings.right);
    if (typeof output !== "number") throw new Error("WASM_RESULT");
    result = output; call.output = result;
    const returned = modelStep("returnLocal", "El export devuelve un número a JavaScript", null, result, "El resultado proviene de la ejecución del módulo, no de una animación de la división.", "browser", "i32 → Number de JavaScript", "setResult(result);", "Se registra el retorno de la función. Reproducir solo recorre esta captura y no vuelve a instanciar ni llamar al módulo.", interaction("Export dividir de Wasm", "Wrapper JavaScript", "WebAssembly · retorno real"));
    returned.provenance = "observed"; entries.push(returned);
  } catch (cause) {
    error = typeof WebAssembly !== "undefined" && cause instanceof WebAssembly.RuntimeError ? "WASM_TRAP" : cause instanceof Error && cause.message === "WASM_UNAVAILABLE" ? "WASM_UNAVAILABLE" : "WASM_FAILURE";
    const failed = entries.at(-1)!; failed.state = "error"; failed.error = { code: error, message: cause instanceof Error ? cause.message : "El runtime no completó la operación." };
  }
  return { settings, bytes: Array.from(bytes), result, expected: settings.right === 0 ? null : Math.trunc(settings.left / settings.right), error, invoked, capture: { id: "advanced:wasm", mode: "local", events: indexEvents("advanced:wasm", entries) } };
}

import { describe, expect, test } from "vitest";
import { storageParameters } from "@/lib/order-storage";
import { localCapture, scenarios, simulate } from "@/lib/scenarios";
import { event } from "@/lib/trace";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { OrderStorageExample } from "@/components/order-storage-example";

describe("SQL conceptual asociado a una escritura", () => {
  test("proyecta los valores del evento sin modificarlo ni tomar un borrador posterior", () => {
    const capture = simulate("201", 2);
    const stored = capture.events.find(entry => entry.stage === "persist")!;
    const before = structuredClone(capture);
    const parameters = storageParameters(stored);
    expect(parameters).toEqual(["pedido-simulado", "kit-api", 2, 17800, "PEN", "created"]);
    simulate("201", 5);
    expect(storageParameters(stored)).toEqual(parameters);
    expect(capture).toEqual(before);
    parameters![0] = "otro-id";
    expect(storageParameters(stored)?.[0]).toBe("pedido-simulado");
  });

  test.each(scenarios)("%s solo permite parámetros en el paso que representa una escritura", scenario => {
    for (const entry of simulate(scenario).events) {
      expect(storageParameters(entry) !== null).toBe(entry.stage === "persist");
    }
  });

  test("favoritos nunca ofrece una inserción", () => {
    expect(localCapture(true).events.every(entry => storageParameters(entry) === null)).toBe(true);
  });

  test.each([null, [], {}, { id: "incompleto" }])("no inventa parámetros a partir de una salida incompleta: %j", output => {
    expect(storageParameters(event("persist", null, output))).toBeNull();
  });

  test.each([
    { id: "" }, { id: "a".repeat(81) }, { sku: "otro" }, { quantity: 0 }, { quantity: 1.5 },
    { quantity: 6 }, { totalMinor: 1 }, { totalMinor: Infinity }, { currency: "USD" }, { status: "confirmed" },
  ])("no representa una creación con datos incompatibles: %j", change => {
    const stored = simulate("201").events.find(entry => entry.stage === "persist")!;
    stored.output = { ...(stored.output as Record<string, unknown>), ...change };
    expect(storageParameters(stored)).toBeNull();
  });

  test("un paso fallido no se convierte en una inserción completada", () => {
    const stored = simulate("201").events.find(entry => entry.stage === "persist")!;
    stored.state = "error";
    expect(storageParameters(stored)).toBeNull();
    const html = renderToStaticMarkup(createElement(OrderStorageExample, { captureId: "failed", entry: stored }));
    expect(html).toContain("Este paso no confirma una escritura correcta");
    expect(html).not.toContain("INSERT INTO");
  });

  test("el panel explica datos incompletos y no aparece para una lectura", () => {
    const html = renderToStaticMarkup(createElement(OrderStorageExample, { captureId: "incomplete", entry: event("persist") }));
    expect(html).toContain("No se completan desde el formulario ni desde otra respuesta");
    expect(html).not.toContain("INSERT INTO");
    expect(renderToStaticMarkup(createElement(OrderStorageExample, { captureId: "read", entry: event("readStore") }))).toBe("");
  });
});

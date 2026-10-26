import type { NetworkSettings } from "@/lib/network";

export function NetworkControls({ value, onChange }: { value: NetworkSettings; onChange: (next: NetworkSettings) => void }) {
  return <details className="network-controls" open><summary>Condiciones de la próxima simulación</summary>
    <div className="network-fields"><label>Destino ilustrativo<select value={value.target} onChange={e => onChange({ ...value, target: e.target.value as NetworkSettings["target"] })}><option value="local">IP local · HTTP</option><option value="http">Nombre remoto · HTTP</option><option value="https">Nombre remoto · HTTPS</option></select></label>
      <label>Entrada al servidor<select value={value.ingress} onChange={e => onChange({ ...value, ingress: e.target.value as NetworkSettings["ingress"] })}><option value="direct">Directa</option><option value="proxy">Reverse proxy</option><option value="balanced">Proxy + balanceador</option></select></label>
      <label className="check-field"><input type="checkbox" checked={value.dnsCached} onChange={e => onChange({ ...value, dnsCached: e.target.checked })} /> Caché DNS válida</label>
      <label className="check-field"><input type="checkbox" checked={value.reuseConnection} onChange={e => onChange({ ...value, reuseConnection: e.target.checked })} /> Reutilizar conexión abierta</label>
    </div><p>Se aplican al ejecutar. No se contacta el destino ficticio. Una conexión abierta evita nuevas consultas DNS y handshakes, incluso con la casilla de caché desactivada.</p>
  </details>;
}

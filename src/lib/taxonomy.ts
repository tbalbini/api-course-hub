import { axes, categories, classificationExercise, exerciseCategories, layers, relations, technologies, type AxisId, type Technology } from "@/content/taxonomy";

export type TaxonomyFilters = Partial<Record<AxisId, string>>;
export const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
export const facets = axes.flatMap(axis => axis.facets);
export const facetName = (id: string) => facets.find(facet => facet.id === id)?.label ?? id;
export function dimensions(technology: Technology, axis: AxisId) {
  const ids = axes.find(item => item.id === axis)!.facets.map(facet => facet.id);
  return { defined: technology.defined.filter(id => ids.includes(id)), possible: technology.possible.filter(id => ids.includes(id)) };
}
export function filterTechnologies(query: string, filters: TaxonomyFilters): Technology[] {
  const text = normalize(query);
  return technologies.filter(item => {
    const associations = [...item.defined, ...item.possible];
    const searchable = [item.id, item.name, categories[item.category], item.why, item.what, ...associations.map(facetName)].join(" ");
    return normalize(searchable).includes(text) && Object.entries(filters).every(([axis, id]) => !id || (axes.find(item => item.id === axis)?.facets.some(facet => facet.id === id) && associations.includes(id)));
  });
}
export function compareTechnologies(a: Technology, b: Technology) {
  if (a.id === b.id) return { same: true, crosses: false, explanation: "Has seleccionado la misma ficha. Elige otra para contrastar responsabilidades y dimensiones." };
  const relation = relations.find(item => (item.a === a.id && item.b === b.id) || (item.b === a.id && item.a === b.id));
  const crosses = a.category !== b.category || a.layer !== b.layer;
  return { same: false, crosses, explanation: relation?.explanation ?? (crosses ? `${a.name}: ${categories[a.category]}, capa de ${layers[a.layer].toLowerCase()}. ${b.name}: ${categories[b.category]}, capa de ${layers[b.layer].toLowerCase()}. Son responsabilidades distintas; la comparación no las convierte en alternativas directas ni demuestra que se puedan combinar.` : "Comparten categoría y capa, pero eso no demuestra equivalencia ni sustitución directa. Compara sus mecanismos, límites y el objetivo de la interacción.") };
}
export function evaluateClassification(answers: Record<string, string>) {
  return classificationExercise.map(item => ({ label: item.label, correct: answers[item.label] === item.answer, feedback: `${answers[item.label] ? `Elegiste ${exerciseCategories[answers[item.label] as keyof typeof exerciseCategories] ?? "una categoría desconocida"}. ` : "Falta clasificar. "}${item.reason}` }));
}

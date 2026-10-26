import { describe, expect, test } from "vitest";
import { awardCourse, courseComplete, courseGoals, courseLocation, decodeCourseProgress, initialCourseProgress, mergeCourseProgress } from "@/lib/course-progress";

describe("Progreso del currículo", () => {
  test("une logros de pestañas sin borrar evaluaciones ni contexto ante datos inválidos", () => {
    const first = { ...awardCourse(initialCourseProgress, 6, courseGoals[6], true), depth: "internals" as const, location: "/compare" };
    const incoming = { ...awardCourse(initialCourseProgress, 5, ["json"]), depth: "engineering" as const, location: "/playground?tab=http" };
    const merged = mergeCourseProgress(first, incoming);
    expect(courseComplete(merged, 6)).toBe(true);
    expect(merged.chapters[5]?.flags).toEqual(["json"]);
    expect(merged.depth).toBe("engineering");
    expect(merged.location).toBe("/playground?tab=http");
    expect(mergeCourseProgress(merged, decodeCourseProgress('{"version":99}'))).toEqual(merged);
    expect(first.chapters[5]).toBeUndefined();
    expect(incoming.chapters[6]).toBeUndefined();
  });
  test("requiere actividades y razonamiento, conserva logros sin mutar la captura anterior", () => {
    const first = awardCourse(initialCourseProgress, 7, ["sseCommand", "inventado"]);
    expect(first.chapters[7]?.flags).toEqual(["sseCommand"]);
    expect(courseComplete(first, 7)).toBe(false);
    const activities = awardCourse(first, 7, courseGoals[7]);
    expect(courseComplete(activities, 7)).toBe(false);
    const finished = awardCourse(activities, 7, [], true);
    expect(courseComplete(finished, 7)).toBe(true);
    expect(awardCourse(finished, 7, [], false)).toBe(finished);
    expect(first.chapters[7]?.flags).toEqual(["sseCommand"]);
    expect(initialCourseProgress.chapters).toEqual({});
  });
  test.each([null, "{", "[]", JSON.stringify({ version: 99, chapters: {} }), "x".repeat(8193)])("tolera datos inválidos: %s", raw => {
    expect(decodeCourseProgress(raw)).toEqual(initialCourseProgress);
  });
  test("filtra datos desconocidos y no interpreta strings como evaluaciones aprobadas", () => {
    const saved = decodeCourseProgress(JSON.stringify({ version: 1, chapters: { 0: { flags: ["sum42"], quizPassed: true }, 7: { flags: ["sseCommand", "sseCommand", "fake"], quizPassed: "true" }, 99: { quizPassed: true } }, depth: "admin", location: "https://evil.example" }));
    expect(saved.chapters).toEqual({ 7: { flags: ["sseCommand"], quizPassed: false } });
    expect(saved.location).toBeNull(); expect(saved.depth).toBeNull();
  });
  test("recupera progreso parcial y completo por capítulo sin mezclarlos", () => {
    let progress = awardCourse(initialCourseProgress, 9, courseGoals[9], true);
    progress = awardCourse(progress, 5, ["json"]);
    const decoded = decodeCourseProgress(JSON.stringify({ ...progress, depth: "internals", location: "/contracts?tab=retries" }));
    expect(courseComplete(decoded, 9)).toBe(true); expect(courseComplete(decoded, 5)).toBe(false);
    expect(decoded.chapters[5]?.flags).toEqual(["json"]); expect(decoded.depth).toBe("internals");
    expect(decoded.location).toBe("/contracts?tab=retries");
  });
});
describe("Contexto permitido", () => {
  test.each(["https://evil.example", "//evil.example", "/\\evil.example", "/api/orders", "/course", "/unknown", "/contracts?tab=" + "x".repeat(201)])("rechaza %s", source => expect(courseLocation(source)).toBeNull());
  test("retiene solo capítulo o pestaña conocidos, nunca datos adicionales", () => {
    expect(courseLocation("/contracts?tab=retries&token=secret#result")).toBe("/contracts?tab=retries");
    expect(courseLocation("/playground?tab=unknown&message=private")).toBe("/playground");
    expect(courseLocation("/first-principles?chapter=3")).toBe("/first-principles?chapter=3");
    expect(courseLocation("/compare?authorization=secret")).toBe("/compare");
  });
});

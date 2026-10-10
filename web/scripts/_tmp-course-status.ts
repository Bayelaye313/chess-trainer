import { CURRICULUM_THEMES } from "@/core/curriculum/catalog";
import { COURSE_LESSONS } from "@/core/curriculum/course-lesson";
import { COURSE_TREES } from "@/core/curriculum/course-tree";
const cat = process.argv[2] ?? "positional_mastery";
const themes = CURRICULUM_THEMES.filter((t) => t.category === cat);
for (const [i, t] of themes.entries()) {
  const id = (t as { id?: string }).id ?? "";
  const tree = COURSE_TREES[id], lesson = COURSE_LESSONS[id];
  const src = tree ? `TREE ${tree.chapters.length} ch` : lesson ? `LESSON ${lesson.steps.length} st, ${lesson.steps.reduce((n, s) => n + (s.moveSan?.length ?? 0), 0)} coups` : "— (exemples puzzles)";
  console.log(`${i + 1}\t${id}\t${t.title}\t${src}`);
}

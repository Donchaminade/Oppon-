import React from 'react';
import { Course, Lesson, UserStats, AppSettings, TypingSessionResult } from '../types';
import { COURSES } from '../data/courses';
import { TypingCanvas } from './TypingCanvas';
import { Lock, Star, CheckCircle, Award, Play } from 'lucide-react';

interface CourseSelectorProps {
  stats: UserStats;
  settings: AppSettings;
  onCompleteLesson: (result: TypingSessionResult, lessonId: string) => void;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  stats,
  settings,
  onCompleteLesson
}) => {
  const [activeLesson, setActiveLesson] = React.useState<Lesson | null>(null);

  const isLessonCompleted = (lessonId: string) => stats.completedLessons.includes(lessonId);
  const getStars = (lessonId: string) => stats.starsMap[lessonId] || 0;

  if (activeLesson) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <button
            onClick={() => setActiveLesson(null)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-lg transition-all"
          >
            ← Retour aux cours
          </button>
          <div className="text-sm font-bold text-cyan-400">{activeLesson.title}</div>
        </div>

        <TypingCanvas
          title={activeLesson.title}
          targetText={activeLesson.text}
          settings={settings}
          mode="lesson"
          targetWpm={activeLesson.targetWpm}
          minAccuracy={activeLesson.minAccuracy}
          onComplete={(res) => onCompleteLesson(res, activeLesson.id)}
          onNextLesson={() => {
            // Find next lesson in list
            const allLessons = COURSES.flatMap((c) => c.lessons);
            const currentIdx = allLessons.findIndex((l) => l.id === activeLesson.id);
            if (currentIdx !== -1 && currentIdx < allLessons.length - 1) {
              setActiveLesson(allLessons[currentIdx + 1]);
            } else {
              setActiveLesson(null);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/80 to-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-xs font-bold text-cyan-400">
            <span>🎓</span> Programme Dactylographique Opponè Collège
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Apprenez à taper à 10 doigts sans regarder le clavier
          </h2>
          <p className="text-sm text-slate-400 max-w-xl">
            Progressez pas à pas à travers nos 15 leçons guidées. Maîtrisez d'abord la rangée centrale, puis la rangée supérieure, inférieure, les chiffres et le code.
          </p>
        </div>

        {/* Global Progress Widget */}
        <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl min-w-[200px] text-center space-y-2">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Progression Globale</div>
          <div className="text-3xl font-black text-cyan-400 font-mono">
            {stats.completedLessons.length} / {COURSES.flatMap((c) => c.lessons).length}
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full transition-all"
              style={{
                width: `${(stats.completedLessons.length / COURSES.flatMap((c) => c.lessons).length) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Courses Accordion/Grid */}
      <div className="space-y-8">
        {COURSES.map((course, courseIdx) => {
          const completedCount = course.lessons.filter((l) => isLessonCompleted(l.id)).length;
          const isUnlocked = courseIdx === 0 || COURSES[courseIdx - 1].lessons.every((l) => isLessonCompleted(l.id));

          return (
            <div
              key={course.id}
              className={`
                bg-slate-900 border rounded-3xl p-6 sm:p-8 shadow-xl transition-all space-y-6
                ${isUnlocked ? 'border-slate-800' : 'border-slate-800/40 opacity-70'}
              `}
            >
              {/* Course Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                    {course.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">{course.level}</span>
                      {!isUnlocked && <Lock size={14} className="text-slate-500" />}
                    </div>
                    <h3 className="text-xl font-bold text-white">{course.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{course.description}</p>
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-slate-400">
                  {completedCount} / {course.lessons.length} Leçons terminées
                </div>
              </div>

              {/* Lessons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {course.lessons.map((lesson) => {
                  const completed = isLessonCompleted(lesson.id);
                  const stars = getStars(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      className={`
                        bg-slate-950/70 border rounded-2xl p-4 transition-all flex flex-col justify-between gap-4 group hover:border-cyan-500/50
                        ${completed ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-slate-800/80'}
                      `}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 font-mono">
                            Objectif: {lesson.targetWpm} WPM
                          </span>
                          {completed ? (
                            <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                              <CheckCircle size={14} /> Réussi
                            </span>
                          ) : (
                            <div className="flex text-amber-400 gap-0.5 text-xs">
                              <Star size={12} className={stars >= 1 ? 'fill-amber-400' : 'text-slate-700'} />
                              <Star size={12} className={stars >= 2 ? 'fill-amber-400' : 'text-slate-700'} />
                              <Star size={12} className={stars >= 3 ? 'fill-amber-400' : 'text-slate-700'} />
                            </div>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {lesson.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{lesson.description}</p>

                        {lesson.keysTaught && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {lesson.keysTaught.map((k) => (
                              <span key={k} className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 text-[10px] font-mono text-cyan-300 rounded">
                                {k}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setActiveLesson(lesson)}
                        className={`
                          w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-98
                          ${completed
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'}
                        `}
                      >
                        <Play size={14} /> {completed ? 'Refaire la leçon' : 'Commencer'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import type { GameState } from '../types/game'
import { createLearningReport, safetyGrade } from '../game/engine'

export default function EndingScreen({ game, onRestart }: { game: GameState; onRestart: () => void }) {
  const active = game.family.filter((member) => !member.unableToAct).length
  const report = createLearningReport(game)
  return (
    <main className="ending-screen">
      <div className="ending-card">
        <span className="ending-icon">{game.ending?.icon}</span>
        <span className="eyebrow">30일 안전 여행 결과</span>
        <h1>{game.ending?.title}</h1>
        <p>{game.ending?.description}</p>
        <div className="ending-stats">
          <div><b>{active}/{game.family.length}</b><span>함께 활동</span></div>
          <div><b>Lv.{game.level}</b><span>{safetyGrade(game.level)}</span></div>
          <div><b>{report.mastery}%</b><span>안전 선택 달성도</span></div>
        </div>
        <section className="learning-report">
          <div className="report-heading"><div><span className="eyebrow">개인화 학습 리포트</span><h2>30일 동안 이렇게 성장했어요</h2></div><b>{report.safeChoices}/{report.totalChoices}회</b></div>
          <div className="report-categories">
            {report.categories.map((category) => (
              <div className={category.total ? '' : 'not-attempted'} key={category.category}>
                <span>{category.label}</span><div><i style={{ width: `${category.score}%` }} /></div><b>{category.total ? `${category.score}%` : '미경험'}</b>
              </div>
            ))}
          </div>
          <div className="report-insights">
            <div><span>🌟 잘 지킨 수칙</span><b>{report.strengths.length ? report.strengths.map((item) => item.label).join(' · ') : '안전 선택을 시작해 보세요'}</b></div>
            <div><span>🌱 더 연습할 영역</span><b>{report.growthAreas.length ? report.growthAreas.map((item) => item.label).join(' · ') : '새로운 재난에 도전해 보세요'}</b></div>
          </div>
          <div className="ending-badges">
            <strong>획득한 디지털 배지</strong>
            <div>{game.badges.length ? game.badges.map((badge) => <span key={badge.id}>{badge.icon}<b>{badge.name}</b><small>{badge.description}</small></span>) : <p>안전한 선택을 이어가면 배지를 받을 수 있어요.</p>}</div>
          </div>
        </section>
        <div className="lesson-box">
          <strong>오늘의 안전 약속</strong>
          <p>공식 안내를 확인하고, 위험한 곳에는 가까이 가지 않으며, 가족과 함께 행동해요.</p>
        </div>
        <button className="primary-button" onClick={onRestart}>다른 가족으로 다시 시작</button>
      </div>
    </main>
  )
}

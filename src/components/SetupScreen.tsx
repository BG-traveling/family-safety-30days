import { DISASTERS, FAMILY } from '../data/gameData'
import type { DisasterId, FamilyId } from '../types/game'

export default function SetupScreen({ selected, disaster, message, onToggle, onDisaster, onStart }: {
  selected: FamilyId[]
  disaster?: DisasterId
  message: string
  onToggle: (id: FamilyId) => void
  onDisaster: (id: DisasterId) => void
  onStart: () => void
}) {
  return (
    <main className="setup-shell">
      <header className="hero">
        <div className="hero-mark">30</div>
        <div>
          <span className="eyebrow">어린이 재난 안전 교육 게임</span>
          <h1>우리 가족 안전 30일</h1>
          <p>서로 돕고 안전 수칙을 배우며 따뜻한 집을 지켜요.</p>
        </div>
      </header>

      <section className="setup-panel">
        <div className="section-heading">
          <div><span>STEP 1</span><h2>함께할 가족을 골라요</h2></div>
          <b>{selected.length} / 3명</b>
        </div>
        <p className="helper">최대 3명까지 선택할 수 있어요. 각자 특별한 능력이 있어요!</p>
        <div className="family-picker">
          {FAMILY.map((member) => {
            const active = selected.includes(member.id)
            return (
              <button key={member.id} className={`family-option ${active ? 'selected' : ''}`} onClick={() => onToggle(member.id)} aria-pressed={active}>
                <span className="pick-avatar" style={{ background: member.color }}>{member.emoji}</span>
                <strong>{member.name}</strong>
                <small>{member.abilityText}</small>
                <i>{active ? '✓ 선택됨' : '선택하기'}</i>
              </button>
            )
          })}
        </div>
        <div className="section-heading disaster-heading">
          <div><span>STEP 2</span><h2>대비할 재난을 골라요</h2></div>
        </div>
        <div className="disaster-picker">
          {DISASTERS.map((item) => (
            <button key={item.id} className={`disaster-option ${disaster === item.id ? 'selected' : ''}`} onClick={() => onDisaster(item.id)} aria-pressed={disaster === item.id}>
              <span>{item.icon}</span><div><strong>{item.name}</strong><small>{item.description}</small></div>
            </button>
          ))}
        </div>
        <div className="start-row">
          <p role="status">{message || (selected.length && disaster ? '준비 완료! 가족의 안전 이야기를 시작해요.' : '가족과 재난을 선택하면 시작할 수 있어요.')}</p>
          <button className="primary-button" disabled={!selected.length || !disaster} onClick={onStart}>30일 안전 여행 시작</button>
        </div>
      </section>
    </main>
  )
}

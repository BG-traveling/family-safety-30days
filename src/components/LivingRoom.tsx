import type { CharacterState, DisasterId } from '../types/game'

const faces = { calm: '•ᴗ•', worried: '•︵•', hurt: '×︵×', hungry: '•﹏•', relieved: 'ᵔᴗᵔ', alert: '•o•' }

export default function LivingRoom({ disaster, risk, family, action }: {
  disaster: DisasterId
  risk: number
  family: CharacterState[]
  action?: 'prepare' | 'care' | 'explore' | 'caution'
}) {
  return (
    <section className={`living-room disaster-${disaster} risk-${risk > 65 ? 'high' : risk > 35 ? 'mid' : 'low'} ${action ? `action-${action}` : ''}`} aria-label="재난 상황에 따라 변화하는 거실">
      <div className="window">
        <div className="outside">
          {disaster === 'typhoon' && <><i className="wind w1" /><i className="wind w2" /><b className="cloud">☁</b></>}
          {disaster === 'rain' && <><i className="rain-lines" /><b className="water-level" /></>}
          {disaster === 'earthquake' && <><b className="city">▥ ▤ ▥</b><i className="shake-mark">⌁</i></>}
        </div>
        {risk > 60 && <span className="crack">ϟ</span>}
      </div>
      <div className="radio">📻<small>안전 방송</small></div>
      <div className="shelf"><span>🩹</span><span>💧</span><span>🔦</span></div>
      <div className="sofa" />
      <div className="table"><span>비상가방 🎒</span></div>
      <div className="room-family">
        {family.map((member) => (
          <div className={`room-person ${member.unableToAct ? 'resting' : ''}`} key={member.id} style={{ '--character': member.color } as React.CSSProperties}>
            <span className="person-head">{faces[member.mood]}</span>
            <span className="person-body">{member.emoji}</span>
            <small>{member.name}</small>
          </div>
        ))}
      </div>
      {action && (
        <div className="action-visual" aria-live="polite">
          <span>{action === 'explore' ? '🎒' : action === 'care' ? '💗' : action === 'caution' ? '⚠️' : '🛠️'}</span>
          <i>{action === 'explore' ? '안전 탐색 중!' : action === 'care' ? '서로 돌보는 중!' : action === 'caution' ? '위험을 확인하는 중!' : '안전하게 준비하는 중!'}</i>
        </div>
      )}
      {disaster === 'earthquake' && <div className="wall-crack">⌁</div>}
      <div className="risk-indicator">현재 위험도 <strong>{risk}</strong></div>
    </section>
  )
}

import type { CharacterState } from '../types/game'

const moodFace = {
  calm: '•ᴗ•',
  worried: '•︵•',
  hurt: '×︵×',
  hungry: '•﹏•',
  relieved: '˶ᵔ ᵕ ᵔ˶',
  alert: '•o•',
}

export default function CharacterCard({ member, compact = false, onHeal }: {
  member: CharacterState
  compact?: boolean
  onHeal?: () => void
}) {
  return (
    <article className={`character-card ${member.unableToAct ? 'is-resting' : ''}`}>
      <div className="avatar" style={{ '--character': member.color } as React.CSSProperties} aria-hidden="true">
        <span className="hair" />
        <span className="face">{moodFace[member.mood]}</span>
        <span className="body">{member.emoji}</span>
      </div>
      <div className="character-info">
        <div className="character-name">
          <strong>{member.name}</strong>
          <span>{member.unableToAct ? '구조 대기' : member.outfit}</span>
        </div>
        {!compact && <p className="ability">{member.abilityText}</p>}
        <Meter label="체력" value={member.health} color="#ef6b6b" />
        <Meter label="배고픔" value={member.hunger} color="#f3a83b" />
        <Meter label="갈증" value={member.thirst} color="#4ea7e8" />
        {onHeal && !member.unableToAct && member.health < 100 && (
          <button className="mini-button" onClick={onHeal}>구급상자 사용</button>
        )}
      </div>
    </article>
  )
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="meter" aria-label={`${label} ${value}`}>
      <span>{label}</span>
      <div><i style={{ width: `${value}%`, background: color }} /></div>
      <b>{value}</b>
    </div>
  )
}

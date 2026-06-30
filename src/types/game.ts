export type FamilyId = 'mom' | 'dad' | 'grandma' | 'grandpa' | 'sister' | 'brother' | 'me'
export type DisasterId = 'typhoon' | 'rain' | 'earthquake'
export type Mood = 'calm' | 'worried' | 'hurt' | 'hungry' | 'relieved' | 'alert'
export type ItemKey = 'bread' | 'water' | 'medkit'
export type StatKey = 'health' | 'hunger' | 'thirst'
export type Phase = 'setup' | 'playing' | 'ending'
export type LearningCategory = 'preparedness' | 'information' | 'evacuation' | 'resources' | 'community'
export type ChoiceQuality = 'safe' | 'neutral' | 'risky'
export type StrategyId = 'inspect' | 'supplies' | 'communicate' | 'recover' | 'weather' | 'route' | 'windows' | 'hygiene' | 'neighbor' | 'radio-check'
export type ScenarioPhase = 'prepare' | 'impact' | 'recovery'

export interface FamilyDefinition {
  id: FamilyId
  name: string
  emoji: string
  color: string
  outfit: string
  ability: string
  abilityText: string
}

export interface CharacterState extends FamilyDefinition {
  health: number
  hunger: number
  thirst: number
  mood: Mood
  unableToAct: boolean
}

export interface Resources {
  bread: number
  water: number
  medkit: number
}

export interface Effect {
  stat?: StatKey
  amount?: number
  item?: ItemKey
  itemAmount?: number
  risk?: number
  preparedness?: number
  rescue?: number
  target?: 'all' | 'random'
}

export interface Choice {
  id: string
  label: string
  result: string
  tip: string
  effects: Effect[]
  category?: LearningCategory
  quality?: ChoiceQuality
}

export interface DailyEvent {
  id: string
  disasters: DisasterId[] | 'all'
  title: string
  description: string
  icon: string
  category?: LearningCategory
  choices: Choice[]
  scenario?: ScenarioMetadata
}

export interface ScenarioMetadata {
  scenarioId: string
  hazards: string[]
  phase: ScenarioPhase
  nextEventIds?: string[]
  sourceNote?: string
}

export interface CompoundScenario {
  id: string
  title: string
  hazards: string[]
  eventIds: string[]
  sourceNote: string
}

export interface Strategy {
  id: StrategyId
  title: string
  description: string
  icon: string
}

export interface ChoiceRecord {
  day: number
  eventId: string
  choiceId: string
  choiceLabel: string
  category: LearningCategory
  quality: ChoiceQuality
  principle: string
  outcomeText: string
  farmingOutcome?: 'success' | 'empty'
  xpEarned: number
  comboAfter: number
}

export interface Badge {
  id: string
  name: string
  icon: string
  description: string
}

export interface LearningCategoryReport {
  category: LearningCategory
  label: string
  safe: number
  total: number
  score: number
}

export interface LearningReport {
  totalChoices: number
  safeChoices: number
  mastery: number
  strengths: LearningCategoryReport[]
  growthAreas: LearningCategoryReport[]
  categories: LearningCategoryReport[]
}

export interface DisasterDefinition {
  id: DisasterId
  name: string
  icon: string
  description: string
  safety: string
}

export interface LogEntry {
  day: number
  text: string
  tone: 'info' | 'good' | 'warning'
}

export interface GameState {
  phase: Phase
  day: number
  disaster: DisasterId
  family: CharacterState[]
  resources: Resources
  risk: number
  preparedness: number
  rescue: number
  xp: number
  level: number
  combo: number
  bestCombo: number
  badges: Badge[]
  choiceHistory: ChoiceRecord[]
  selectedStrategy?: StrategyId
  currentEvent: DailyEvent
  logs: LogEntry[]
  ending?: Ending
}

export interface Ending {
  id: string
  title: string
  icon: string
  description: string
}

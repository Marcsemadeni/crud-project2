export interface Character {
  id: string
  name: string
  class: string
  level: number
  health: number
  mana: number
}

export type NewCharacter = Omit<Character, 'id'>

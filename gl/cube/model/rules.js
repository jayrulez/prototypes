import {
  F, B, U, D, R, L,
  N, W, S, E, SE, SLOT_M, SLOT_D,
  COLOR_D as CD, COLOR_F as CF, COLOR_R as CR
} from './consts'

const SE_D_AS_F = { [F]: CD, [U]: CF, [R]: CR }
const SE_D_AS_R = { [F]: CF, [U]: CR, [R]: CD }
const SE_D_AS_U = { [F]: CR, [U]: CD, [R]: CF }

const SLOT_M_SOLVED = { [F]: CF, [R]: CR }
// const SLOT_M_REVERSED = { [F]: CR, [R]: CF }
// const SLOT_D_SOLVED = { [F]: CF, [R]: CR, [D]: CD }
// const SLOT_D_D_AS_F = { [F]: CD, [R]: CF, [D]: CR }
const SLOT_D_D_AS_R = { [F]: CR, [R]: CD, [D]: CF }

const topEdge = (topColor, dir) => {
  const mapping = { [W]: L, [N]: B, [E]: R, [S]: F }
  return { [U]: topColor, [mapping[dir]]: topColor === CF ? CR : CF }
}

// https://www.speedsolving.com/wiki/index.php/F2L
export const F2L = [
  // 1
  {
    match: { [E]: topEdge(CF, E), [SE]: SE_D_AS_F },
    moves: "U (R U' R')"
  },
  // 2
  {
    match: { [S]: topEdge(CR, S), [SE]: SE_D_AS_R },
    moves: "U' (F' U F)"
  },
  // 7
  {
    match: { [W]: topEdge(CF, W), [SE]: SE_D_AS_F },
    moves: "U' (R U2' R') U U (R U' R')"
  },
  // 8
  { match: { [N]: topEdge(CR, N), [SE]: SE_D_AS_R },
    moves: "(U F' U U F) (U F' U U F)" },
  // 10
  {
    match: { [W]: topEdge(CF, W), [SE]: SE_D_AS_R },
    moves: "U' (R U R' U) (R U R')"
  },
  // 15
  {
    match: { [S]: topEdge(CF, S), [SE]: SE_D_AS_F },
    moves: "R B L U' L' B' R'"
  },
  // 20
  {
    match: { [W]: topEdge(CR, W), [SE]: SE_D_AS_U },
    moves: "U' F' U U F F (R' F' R)"
  },
  // 22
  {
    match: { [N]: topEdge(CR, N), [SE]: SE_D_AS_U },
    moves: "F' L' U U L F"
  },
  // 40
  {
    match: { [SLOT_D]: SLOT_D_D_AS_R, [SLOT_M]: SLOT_M_SOLVED },
    moves: "(R U' R' U) (R U U R') U (R U' R')"
  }
].map(rule => ({
  match: rule.match,
  moves: rule.moves.replace(/(\(|\))/g, '').split(' ')
}))

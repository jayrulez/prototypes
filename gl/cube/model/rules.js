import {
  F, B, U, R, L,
  N, W, S, E, SE,
  COLOR_D as CD, COLOR_L as CL, COLOR_R as CR
} from './consts'

const SE_D_AS_F = { [F]: CD, [U]: CL, [R]: CR }
const SE_D_AS_R = { [F]: CL, [U]: CR, [R]: CD }
// const SE_D_AS_U = { [F]: CR, [U]: CD, [R]: CL }

const topEdge = (topColor, dir) => {
  const mapping = { [W]: L, [N]: B, [E]: R, [S]: F }
  return { [U]: topColor, [mapping[dir]]: topColor === CL ? CR : CL }
}

// https://www.speedsolving.com/wiki/index.php/F2L
export const F2L = [
  // 2
  {
    match: { [S]: topEdge(CR, S), [SE]: SE_D_AS_R },
    moves: "U' (F' U F)"
  },
  // 7
  {
    match: { [W]: topEdge(CL, W), [SE]: SE_D_AS_F },
    moves: "U' (R U2' R') U U (R U' R')"
  },
  // 8
  { match: { [N]: topEdge(CR, N), [SE]: SE_D_AS_R },
    moves: "(U F' U U F) (U F' U U F)" },
  // 10
  {
    match: { [W]: topEdge(CL, W), [SE]: SE_D_AS_R },
    moves: "U' (R U R' U) (R U R')"
  },
  // 15
  {
    match: { [S]: topEdge(CL, S), [SE]: SE_D_AS_F },
    moves: "R B L U' L' B' R'"
  }
].map(rule => ({
  match: rule.match,
  moves: rule.moves.replace(/(\(|\))/g, '').split(' ')
}))

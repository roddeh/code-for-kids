let layout = `
LL00000000000
0LLL000000000
000L000000000
000LLLL000000
000000L000000
000000L000000
000000LL00000
0000000LLL000
000000000L000
000000000LLLL
000000000000L
000000000000L
000000000000L
`

export default {
  tileSize:30,
  layout,
  turtle:{
    x:0,
    y:0,
    orientation:1
  },
  treasure:{
    x:12,
    y:12,
  }
};
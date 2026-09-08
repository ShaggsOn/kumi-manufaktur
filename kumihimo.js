/* Kongoh Gumi, Z twist. Independent implementation; derivation and references:
 * docs/kongoh-gumi.md. Input order: top-left, top-right, then clockwise pairs.
 */
(function(root){
  'use strict';
  const mod=(value,n)=>((value%n)+n)%n;
  function validate(n){
    if(!Number.isInteger(n)||n<8||n%4!==0)throw new RangeError('Thread count must be a multiple of four, at least eight.');
  }
  function strandCycle(n){
    validate(n);
    const pairCount=n/2,opposite=n/4;
    const pairs=Array.from({length:pairCount},(_,i)=>[2*i,2*i+1]);
    const cycle=[];
    for(let step=0;step<n;step++){
      const top=step%pairCount,bottom=(top+opposite)%pairCount;
      const [topLeft,topRight]=pairs[top];
      // Clockwise order at the bottom is right, then left.
      const [bottomRight,bottomLeft]=pairs[bottom];
      cycle.push(topRight);
      pairs[top]=[bottomLeft,topLeft];
      pairs[bottom]=[topRight,bottomRight];
      // Advancing the working pair clockwise models turning the disk anticlockwise.
    }
    return cycle;
  }
  function strandRows(n,rowCount){
    validate(n);
    if(!Number.isInteger(rowCount)||rowCount<0)throw new RangeError('Invalid row count.');
    const cycle=strandCycle(n),halfTurn=n/4;
    // Unwrap the helical surface. The two staggered rows advance backwards by
    // halfTurn, then halfTurn-1 stitches. After two rows the shift is -(n/2-1).
    return Array.from({length:rowCount},(_,row)=>
      Array.from({length:n/2},(_,col)=>cycle[mod(col-row*halfTurn+Math.floor(row/2),n)]));
  }
  const api={strandCycle,strandRows};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.Kumihimo=api;
})(typeof globalThis==='object'?globalThis:this);

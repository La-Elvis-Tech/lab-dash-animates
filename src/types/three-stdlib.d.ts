declare module 'three-stdlib' {
  export class RoundedBoxGeometry extends THREE.BufferGeometry {
    constructor(
      width?: number,
      height?: number,
      depth?: number,
      radius?: number,
      segments?: number
    );
  }
}
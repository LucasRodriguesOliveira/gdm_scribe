// Sim, inspirado no Result do Rust
export interface Result<T, E> {
  value?: T;
  error?: E;
}

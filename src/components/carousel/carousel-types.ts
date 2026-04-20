import type { Snippet } from "svelte";

export type DotItem = { active: boolean; index: number };

export type PaginationProps = {
  canScrollPrev: boolean;
  prev: () => void;
  canScrollNext: boolean;
  next: () => void;
};

export interface CarouselProps<T> {
  slides?: T[];
  key?: keyof T;
  containerClass?: string;
  slideClass?: string;
}

export interface CarouselSnippets<T> {
  slide: Snippet<[{ slide: T; index: number }]>;
  prev?: Snippet<[{ canScrollPrev: boolean; prev: () => void }]>;
  next?: Snippet<[{ canScrollNext: boolean; next: () => void }]>;
  dots?: Snippet<[{ dots: DotItem[]; scrollTo: (i: number) => void }]>;
  pagination?: Snippet<[PaginationProps]>;
}

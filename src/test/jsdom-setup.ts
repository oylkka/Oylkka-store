import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost:3000',
  pretendToBeVisual: true,
});

globalThis.document = dom.window.document;
globalThis.window = dom.window as unknown as Window & typeof globalThis;
globalThis.navigator = dom.window.navigator;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLButtonElement = dom.window.HTMLButtonElement;
globalThis.HTMLDivElement = dom.window.HTMLDivElement;
globalThis.Node = dom.window.Node;
globalThis.Element = dom.window.Element;
globalThis.Event = dom.window.Event;
globalThis.KeyboardEvent = dom.window.KeyboardEvent;
globalThis.MouseEvent = dom.window.MouseEvent;
globalThis.CustomEvent = dom.window.CustomEvent;
globalThis.NodeList = dom.window.NodeList;
globalThis.RadioNodeList = dom.window.RadioNodeList;
globalThis.HTMLCollection = dom.window.HTMLCollection;
globalThis.DOMTokenList = dom.window.DOMTokenList;
globalThis.DOMParser = dom.window.DOMParser;
globalThis.DocumentFragment = dom.window.DocumentFragment;
globalThis.ShadowRoot = dom.window.ShadowRoot;
globalThis.Comment = dom.window.Comment;
globalThis.Text = dom.window.Text;
globalThis.MutationObserver = dom.window.MutationObserver;
globalThis.DOMRect = dom.window.DOMRect;
globalThis.DOMRectReadOnly = dom.window.DOMRectReadOnly;
globalThis.getComputedStyle = dom.window.getComputedStyle;
globalThis.matchMedia = dom.window.matchMedia;
globalThis.CSS = dom.window.CSS;
globalThis.VisualViewport = dom.window.VisualViewport;

globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => {
  return setTimeout(() => cb(Date.now()), 0) as unknown as number;
};
globalThis.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

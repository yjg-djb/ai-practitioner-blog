export type RecruiterPanelSize = {
  width: number;
  height: number;
};

type ViewportSize = {
  width: number;
  height: number;
};

const MOBILE_BREAKPOINT = 768;
const MOBILE_DEFAULT_SIZE: RecruiterPanelSize = {
  width: 480,
  height: 736,
};
const DESKTOP_DEFAULT_SIZE: RecruiterPanelSize = {
  width: 496,
  height: 704,
};
const MIN_WIDTH = 352;
const MIN_HEIGHT = 560;

export const RECRUITER_PANEL_SIZE_STORAGE_KEY = 'recruiter-assistant:size:v1';

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getViewportSize(): ViewportSize {
  if (typeof window === 'undefined') {
    return { width: 1440, height: 900 };
  }

  return {
    width: Math.round(window.visualViewport?.width ?? window.innerWidth),
    height: Math.round(window.visualViewport?.height ?? window.innerHeight),
  };
}

export function getRecruiterPanelBounds(viewport = getViewportSize()) {
  const isDesktop = viewport.width >= MOBILE_BREAKPOINT;
  const horizontalInset = isDesktop ? 24 : 12;
  const topInset = isDesktop ? 24 : 12;
  const bottomInset = isDesktop ? 24 : 12;
  const maxWidth = Math.max(280, viewport.width - horizontalInset);
  const maxHeight = Math.max(420, viewport.height - bottomInset - topInset);

  return {
    minWidth: Math.min(MIN_WIDTH, maxWidth),
    maxWidth,
    minHeight: Math.min(MIN_HEIGHT, maxHeight),
    maxHeight,
  };
}

export function clampRecruiterPanelSize(
  size: RecruiterPanelSize,
  viewport = getViewportSize(),
): RecruiterPanelSize {
  const bounds = getRecruiterPanelBounds(viewport);

  return {
    width: clamp(Math.round(size.width), bounds.minWidth, bounds.maxWidth),
    height: clamp(Math.round(size.height), bounds.minHeight, bounds.maxHeight),
  };
}

export function getDefaultRecruiterPanelSize(viewport = getViewportSize()): RecruiterPanelSize {
  const base = viewport.width >= MOBILE_BREAKPOINT ? DESKTOP_DEFAULT_SIZE : MOBILE_DEFAULT_SIZE;
  return clampRecruiterPanelSize(base, viewport);
}

export function readStoredRecruiterPanelSize(viewport = getViewportSize()): RecruiterPanelSize | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(RECRUITER_PANEL_SIZE_STORAGE_KEY);

    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<RecruiterPanelSize>;

    if (typeof parsed.width !== 'number' || typeof parsed.height !== 'number') {
      return null;
    }

    return clampRecruiterPanelSize(
      {
        width: parsed.width,
        height: parsed.height,
      },
      viewport,
    );
  } catch {
    return null;
  }
}

export function getInitialRecruiterPanelSize(viewport = getViewportSize()): RecruiterPanelSize {
  return readStoredRecruiterPanelSize(viewport) ?? getDefaultRecruiterPanelSize(viewport);
}

export function writeStoredRecruiterPanelSize(size: RecruiterPanelSize) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(RECRUITER_PANEL_SIZE_STORAGE_KEY, JSON.stringify(size));
  } catch {
    // Ignore storage errors so the panel still works in restricted environments.
  }
}

export function clearStoredRecruiterPanelSize() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(RECRUITER_PANEL_SIZE_STORAGE_KEY);
  } catch {
    // Ignore storage errors so reset still updates in-memory state.
  }
}

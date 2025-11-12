let guardFn = null;

export function registerNavigationGuard(fn) {
  guardFn = fn;
}

export function unregisterNavigationGuard() {
  guardFn = null;
}

export function requestNavigation(action) {
  if (typeof guardFn === "function") {
    try {
      guardFn(action);
    } catch {
      action();
    }
  } else {
    action();
  }
}

export default {
  registerNavigationGuard,
  unregisterNavigationGuard,
  requestNavigation,
};

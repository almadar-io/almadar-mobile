import React, { useEffect, useRef } from 'react';
import { Platform, View, Text, ViewStyle, StyleSheet, requireNativeComponent, UIManager, findNodeHandle } from 'react-native';

// ── Fabric/TurboModule spec ────────────────────────────────────────────────────
//
// The native view `OrbitalGameCanvasView` is registered by:
//   Android: OrbitalGameCanvasViewManager.kt (loads liborbital_shell_android.so,
//            wraps OrbitalGameSurfaceView, passes ANativeWindow* to JNI bridge)
//   iOS:     OrbitalGameCanvasViewManager.swift (wraps MTKView backed by
//             OrbitalGameMTKCoordinator from bridge/OrbitalGameBridge.swift,
//             passes CAMetalLayer* to orbital_game_renderer_init)
//
// On-device native build (Kotlin/Swift compile + NDK/Xcode link) is CI-deferred;
// see docs/Almadar_Compiler_Gaps.md MOBILE-GPU-NATIVE-BUILD.
//
// The JS component below is tsc-clean and runtime-safe: on platforms where the
// native module is absent (e.g. web/simulator without the .so/.a) it renders a
// clearly-labelled placeholder View so the app doesn't crash.

export interface OrbitalGameCanvasProps {
  /** JSON-encoded GameRenderPacket forwarded verbatim to orbital_game_renderer_submit. */
  jsonPacket: string;
  /** Trait name for dispatch wiring. */
  trait: string;
  /** Additional pattern config forwarded as part of the packet. */
  props?: Record<string, unknown>;
  style?: ViewStyle;
  onReady?: () => void;
  onError?: (error: string) => void;
}

// The native component name must match the return value of `getName()` in
// OrbitalGameCanvasViewManager on both platforms.
const NATIVE_VIEW_NAME = 'OrbitalGameCanvasView';

// `requireNativeComponent` throws in test/web environments where the native
// module is not registered.  Guard so tsc-clean JS can run in any context.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let NativeGameCanvas: React.ComponentType<any> | null = null;
const nativeAvailable = Platform.OS === 'android' || Platform.OS === 'ios';
if (nativeAvailable) {
  try {
    NativeGameCanvas = requireNativeComponent(NATIVE_VIEW_NAME);
  } catch {
    // Native module absent: fall through to JS fallback below.
    NativeGameCanvas = null;
  }
}

// ── Native commands ────────────────────────────────────────────────────────────

const COMMANDS: Record<string, number> | undefined = UIManager.getViewManagerConfig
  ? (UIManager.getViewManagerConfig(NATIVE_VIEW_NAME)?.Commands as Record<string, number> | undefined)
  : undefined;

/** Submit a new JSON GameRenderPacket to the already-mounted native renderer. */
function nativeSubmitPacket(ref: React.RefObject<View | null>, jsonPacket: string): void {
  if (!ref.current || !COMMANDS || typeof COMMANDS['submitPacket'] !== 'number') {
    return;
  }
  UIManager.dispatchViewManagerCommand(
    findNodeHandle(ref.current),
    COMMANDS['submitPacket'],
    [jsonPacket],
  );
}

// ── OrbitalGameCanvas ──────────────────────────────────────────────────────────

/**
 * React Native native view that renders game-canvas patterns via the
 * orbital-game-renderer GPU backend (Vulkan on Android, Metal on iOS).
 *
 * The component wraps:
 *   - Android: OrbitalGameSurfaceView → JNI → orbital_game_renderer_init/render
 *   - iOS:     OrbitalGameMTKCoordinator → Swift bridge → orbital_game_renderer_init/render
 *
 * On simulators or web (no GPU adapter) a labelled placeholder is shown.
 */
export const OrbitalGameCanvas: React.FC<OrbitalGameCanvasProps> = ({
  jsonPacket,
  trait,
  props: _props,
  style,
  onReady,
  onError: _onError,
}) => {
  // Ref typed as View so `findNodeHandle` works; the actual native component
  // instance shares the same handle.
  const ref = useRef<View>(null);

  // Re-submit the packet on prop change after the native renderer is mounted.
  useEffect(() => {
    nativeSubmitPacket(ref, jsonPacket);
  }, [jsonPacket]);

  useEffect(() => {
    if (onReady) {
      onReady();
    }
  }, [onReady]);

  if (NativeGameCanvas) {
    // Forward props to the native view; style is merged with the flex default.
    return (
      <NativeGameCanvas
        ref={ref}
        jsonPacket={jsonPacket}
        trait={trait}
        style={[styles.canvas, style]}
      />
    );
  }

  // Fallback: native module absent (web, bare simulator, test environment).
  return (
    <View style={[styles.fallback, style]}>
      <Text style={styles.fallbackText}>
        [OrbitalGameCanvas — native GPU unavailable]
      </Text>
      <Text style={styles.fallbackSub}>{trait}</Text>
    </View>
  );
};

OrbitalGameCanvas.displayName = 'OrbitalGameCanvas';

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    minHeight: 160,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  fallbackText: {
    color: '#aaa',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  fallbackSub: {
    color: '#666',
    fontSize: 10,
    marginTop: 4,
    fontFamily: 'monospace',
  },
});

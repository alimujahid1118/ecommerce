import gsap from "gsap";
import { useEffect, useRef } from "react";

const hoverTargetSelector = "img, video, h1, h2, h3, h4, h5, h6, p, span, strong, em, li, a, button, i, label, svg, input, textarea, select";

export default function Cursor() {
    const cursorRef = useRef(null);

    useEffect(() => {
        const cursor = cursorRef.current;

        if (!cursor) {
            return;
        }

        const updateCursor = (event) => {
            const { clientX, clientY } = event;
            const rawTarget = event.target;
            const target = rawTarget instanceof Element ? rawTarget : rawTarget?.parentElement || null;
            const hoveredTarget = target?.closest(hoverTargetSelector) || target;
            const hideNativeCursor = hoveredTarget?.closest('[data-hide-native-cursor="true"]');
            const shouldInvert = Boolean(hoveredTarget && !hideNativeCursor);
            const shouldEnlarge = shouldInvert && (hoveredTarget.matches("a, button, i, input, textarea, select, label") || hoveredTarget.closest("img, video, h1, h2, h3, h4, h5, h6, p, span, strong, em, li, svg"));

            gsap.to(cursor, {
                x: clientX - 20,
                y: clientY - 20,
                width: shouldEnlarge ? 54 : 40,
                height: shouldEnlarge ? 54 : 40,
                scale: hideNativeCursor ? 0 : shouldEnlarge ? 1.7 : 1,
                opacity: hideNativeCursor ? 0 : 1,
                backgroundColor: "#ffffff",
                mixBlendMode: "difference",
                border: shouldEnlarge ? "1px solid rgba(255,255,255,0.8)" : "none",
                duration: hideNativeCursor ? 0.15 : 0.2,
                ease: "power2.out",
                overwrite: true,
            });
        };

        const handleMouseLeave = () => {
            gsap.to(cursor, {
                opacity: 0,
                duration: 0.15,
                ease: "power2.out",
                overwrite: true,
            });
        };

        window.addEventListener("mousemove", updateCursor);
        window.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", updateCursor);
            window.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            id="cursor"
            className="hidden md:block fixed left-0 top-0 h-[40px] w-[40px] rounded-full pointer-events-none z-[999999] opacity-0"
            style={{
                backgroundColor: "#ffffff",
                mixBlendMode: "difference",
            }}
        />
    );
}

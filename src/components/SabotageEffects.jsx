import { motion } from 'framer-motion';

/**
 * Earthquake Sabotage Effect Component
 * 
 * This component applies a violent shaking animation to any child element.
 * It uses Framer Motion's keyframe animations to create realistic earthquake motion.
 * 
 * Usage:
 * <EarthquakeEffect isActive={true}>
 *   <YourComponent />
 * </EarthquakeEffect>
 */

const EarthquakeEffect = ({ children, isActive, duration = 3000, intensity = 'high' }) => {
    // Define intensity levels
    const intensityMap = {
        low: { x: 2, y: 2, rotate: 0.5 },
        medium: { x: 4, y: 4, rotate: 1 },
        high: { x: 8, y: 8, rotate: 2 },
        extreme: { x: 12, y: 12, rotate: 3 },
    };

    const { x, y, rotate } = intensityMap[intensity] || intensityMap.high;

    // Earthquake animation variants
    const earthquakeVariants = {
        idle: {
            x: 0,
            y: 0,
            rotate: 0,
        },
        shaking: {
            x: [0, -x, x, -x, x, -x / 2, x / 2, 0],
            y: [0, y, -y, y, -y, y / 2, -y / 2, 0],
            rotate: [0, rotate, -rotate, rotate, -rotate, 0],
            transition: {
                duration: 0.5,
                repeat: Math.floor(duration / 500) - 1,
                repeatType: 'loop',
                ease: 'easeInOut',
            },
        },
    };

    return (
        <motion.div
            variants={earthquakeVariants}
            initial="idle"
            animate={isActive ? 'shaking' : 'idle'}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
};

/**
 * Alternative: Pure CSS Earthquake Effect
 * 
 * For performance-critical scenarios, you can use this CSS-based approach:
 * 
 * CSS Keyframes:
 * 
 * @keyframes earthquake {
 *   0%, 100% { transform: translate(0, 0) rotate(0deg); }
 *   10% { transform: translate(-8px, 4px) rotate(1deg); }
 *   20% { transform: translate(8px, -4px) rotate(-1deg); }
 *   30% { transform: translate(-8px, -4px) rotate(2deg); }
 *   40% { transform: translate(8px, 4px) rotate(-2deg); }
 *   50% { transform: translate(-8px, 4px) rotate(1deg); }
 *   60% { transform: translate(8px, -4px) rotate(-1deg); }
 *   70% { transform: translate(-4px, -4px) rotate(0.5deg); }
 *   80% { transform: translate(4px, 4px) rotate(-0.5deg); }
 *   90% { transform: translate(-2px, 2px) rotate(0deg); }
 * }
 * 
 * .earthquake-active {
 *   animation: earthquake 0.5s cubic-bezier(.36,.07,.19,.97) both;
 *   animation-iteration-count: 6;
 * }
 */

/**
 * Fog Sabotage Effect Component
 * 
 * Applies a blur overlay with smooth fade-in/out animations
 */
export const FogEffect = ({ isActive, blurAmount = 8, opacity = 0.3 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={
                isActive
                    ? {
                        opacity: opacity,
                        backdropFilter: `blur(${blurAmount}px)`,
                    }
                    : {
                        opacity: 0,
                        backdropFilter: 'blur(0px)',
                    }
            }
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-black/30 pointer-events-none z-10"
            style={{ willChange: 'opacity, backdrop-filter' }}
        />
    );
};

/**
 * Glitch Sabotage Effect Component
 * 
 * Creates a chromatic aberration effect with RGB channel splitting
 */
export const GlitchEffect = ({ isActive, children }) => {
    const glitchVariants = {
        idle: {
            x: 0,
            filter: 'none',
        },
        glitching: {
            x: [0, -2, 2, -2, 2, 0],
            filter: [
                'none',
                'hue-rotate(90deg)',
                'hue-rotate(-90deg)',
                'hue-rotate(90deg)',
                'none',
            ],
            transition: {
                duration: 0.3,
                repeat: Infinity,
                repeatType: 'loop',
            },
        },
    };

    return (
        <div className="relative w-full h-full">
            <motion.div
                variants={glitchVariants}
                animate={isActive ? 'glitching' : 'idle'}
                className="w-full h-full"
            >
                {children}
            </motion.div>

            {isActive && (
                <>
                    {/* Red Channel */}
                    <motion.div
                        animate={{
                            x: [-2, 2, -2],
                            opacity: [0.5, 0.7, 0.5],
                        }}
                        transition={{
                            duration: 0.2,
                            repeat: Infinity,
                        }}
                        className="absolute inset-0 pointer-events-none mix-blend-screen"
                        style={{
                            background: 'rgba(255, 0, 0, 0.3)',
                            filter: 'blur(1px)',
                        }}
                    />

                    {/* Cyan Channel */}
                    <motion.div
                        animate={{
                            x: [2, -2, 2],
                            opacity: [0.5, 0.7, 0.5],
                        }}
                        transition={{
                            duration: 0.2,
                            repeat: Infinity,
                        }}
                        className="absolute inset-0 pointer-events-none mix-blend-screen"
                        style={{
                            background: 'rgba(0, 255, 255, 0.3)',
                            filter: 'blur(1px)',
                        }}
                    />
                </>
            )}
        </div>
    );
};

/**
 * Screen Flip Sabotage Effect Component
 * 
 * Rotates the entire screen 180 degrees
 */
export const ScreenFlipEffect = ({ isActive, children }) => {
    return (
        <motion.div
            animate={{
                rotateZ: isActive ? 180 : 0,
            }}
            transition={{
                duration: 0.6,
                ease: 'easeInOut',
            }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
};

/**
 * Invert Colors Sabotage Effect Component
 * 
 * Inverts all colors on the screen
 */
export const InvertColorsEffect = ({ isActive, children }) => {
    return (
        <motion.div
            animate={{
                filter: isActive ? 'invert(1)' : 'invert(0)',
            }}
            transition={{
                duration: 0.3,
            }}
            className="w-full h-full"
        >
            {children}
        </motion.div>
    );
};

export default EarthquakeEffect;

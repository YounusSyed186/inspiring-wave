import {
  ComponentPropsWithoutRef,
  ElementType,
  forwardRef,
  ReactNode,
} from 'react';
import {
  motion,
  HTMLMotionProps,
  Variants,
  useReducedMotion,
} from 'framer-motion';

// Easing presets
export const EASINGS = {
  power4Out: [0.16, 1, 0.3, 1] as const,
  smoothOut: [0.22, 1, 0.36, 1] as const,
  anticipate: [0.25, 1, 0.5, 1] as const,
};

/* =========================================================================
   SECTION ANIMATION
   ========================================================================= */

export type SectionAnimationVariant =
  | 'fade-up'
  | 'fade'
  | 'slide-up'
  | 'scale'
  | 'none';

export interface AnimatedSectionProps extends Omit<HTMLMotionProps<'section'>, 'children'> {
  children?: ReactNode;
  animation?: SectionAnimationVariant;
  delay?: number;
  duration?: number;
  amount?: number | 'some' | 'all';
  once?: boolean;
}

const sectionVariants: Record<SectionAnimationVariant, Variants> = {
  'fade-up': {
    hidden: { opacity: 0, y: 48 },
    visible: (custom = {}) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: custom.duration ?? 0.85,
        delay: custom.delay ?? 0,
        ease: EASINGS.smoothOut,
      },
    }),
  },
  'slide-up': {
    hidden: { opacity: 0, y: 72 },
    visible: (custom = {}) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: custom.duration ?? 0.95,
        delay: custom.delay ?? 0,
        ease: EASINGS.power4Out,
      },
    }),
  },
  fade: {
    hidden: { opacity: 0 },
    visible: (custom = {}) => ({
      opacity: 1,
      transition: {
        duration: custom.duration ?? 0.75,
        delay: custom.delay ?? 0,
        ease: EASINGS.smoothOut,
      },
    }),
  },
  scale: {
    hidden: { opacity: 0, scale: 0.96, y: 32 },
    visible: (custom = {}) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: custom.duration ?? 0.85,
        delay: custom.delay ?? 0,
        ease: EASINGS.smoothOut,
      },
    }),
  },
  none: {
    hidden: { opacity: 1, y: 0 },
    visible: { opacity: 1, y: 0 },
  },
};

export const AnimatedSection = forwardRef<HTMLElement, AnimatedSectionProps>(
  function AnimatedSection(
    {
      children,
      className = '',
      animation = 'fade-up',
      delay = 0,
      duration,
      amount = 0.12,
      once = true,
      ...props
    },
    ref
  ) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion || animation === 'none') {
      const {
        style,
        id,
        role,
        tabIndex,
        'aria-label': ariaLabel,
        'aria-labelledby': ariaLabelledby,
        'aria-hidden': ariaHidden,
      } = props as Record<string, unknown>;
      return (
        <section
          ref={ref}
          className={className}
          style={style as React.CSSProperties | undefined}
          id={id as string | undefined}
          role={role as string | undefined}
          tabIndex={tabIndex as number | undefined}
          aria-label={ariaLabel as string | undefined}
          aria-labelledby={ariaLabelledby as string | undefined}
          aria-hidden={ariaHidden as boolean | undefined}
        >
          {children}
        </section>
      );
    }

    return (
      <motion.section
        ref={ref}
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, amount }}
        custom={{ delay, duration }}
        variants={sectionVariants[animation]}
        {...props}
      >
        {children}
      </motion.section>
    );
  }
);

/* =========================================================================
   TEXT ANIMATIONS: WORDS, LINES, CHARACTERS, HEADINGS
   ========================================================================= */

export interface AnimatedWordsProps {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  once?: boolean;
  amount?: number | 'some' | 'all';
  as?: ElementType;
}

const wordsContainerVariants: Variants = {
  hidden: {},
  visible: (custom = {}) => ({
    transition: {
      staggerChildren: custom.stagger ?? 0.04,
      delayChildren: custom.delay ?? 0,
    },
  }),
};

const wordChildVariants: Variants = {
  hidden: {
    opacity: 0,
    y: '105%',
    rotateZ: 1.5,
  },
  visible: (custom = {}) => ({
    opacity: 1,
    y: '0%',
    rotateZ: 0,
    transition: {
      duration: custom.duration ?? 0.65,
      ease: EASINGS.power4Out,
    },
  }),
};

export function AnimatedWords({
  text,
  className = '',
  wordClassName = '',
  delay = 0,
  stagger = 0.035,
  duration = 0.65,
  once = true,
  amount = 0.2,
  as: Component = 'span',
}: AnimatedWordsProps) {
  const shouldReduceMotion = useReducedMotion();
  const words = text.split(/\s+/).filter(Boolean);

  if (shouldReduceMotion) {
    return <Component className={className}>{text}</Component>;
  }

  const MotionComponent = motion.create(Component);

  return (
    <MotionComponent
      className={`animated-words-container ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      custom={{ delay, stagger }}
      variants={wordsContainerVariants}
      style={{ display: 'inline-block' }}
    >
      {words.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            verticalAlign: 'bottom',
            paddingBottom: '0.04em',
            marginRight: i === words.length - 1 ? '0' : '0.28em',
          }}
        >
          <motion.span
            className={wordClassName}
            custom={{ duration }}
            variants={wordChildVariants}
            style={{ display: 'inline-block', willChange: 'transform, opacity' }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </MotionComponent>
  );
}

export interface AnimatedLinesProps {
  lines: string[];
  className?: string;
  lineClassName?: string;
  dataAttribute?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  once?: boolean;
  amount?: number | 'some' | 'all';
  as?: ElementType;
}

const linesContainerVariants: Variants = {
  hidden: {},
  visible: (custom = {}) => ({
    transition: {
      staggerChildren: custom.stagger ?? 0.12,
      delayChildren: custom.delay ?? 0,
    },
  }),
};

const lineChildVariants: Variants = {
  hidden: {
    opacity: 0,
    y: '115%',
  },
  visible: (custom = {}) => ({
    opacity: 1,
    y: '0%',
    transition: {
      duration: custom.duration ?? 0.9,
      ease: EASINGS.power4Out,
    },
  }),
};

export function AnimatedLines({
  lines,
  className = '',
  lineClassName = '',
  dataAttribute,
  delay = 0,
  stagger = 0.12,
  duration = 0.85,
  once = true,
  amount = 0.2,
  as: Component = 'div',
}: AnimatedLinesProps) {
  const shouldReduceMotion = useReducedMotion();
  const lineProps = dataAttribute ? { [dataAttribute]: '' } : {};

  if (shouldReduceMotion) {
    return (
      <Component className={className}>
        {lines.map((line, idx) => (
          <span key={idx} className={lineClassName} {...lineProps} style={{ display: 'block' }}>
            {line}
          </span>
        ))}
      </Component>
    );
  }

  const MotionComponent = motion.create(Component);

  return (
    <MotionComponent
      className={`animated-lines-container ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      custom={{ delay, stagger }}
      variants={linesContainerVariants}
    >
      {lines.map((line, i) => (
        <span
          key={i}
          {...lineProps}
          style={{
            display: 'block',
            overflow: 'hidden',
            paddingBottom: '0.06em',
          }}
        >
          <motion.span
            className={lineClassName}
            custom={{ duration }}
            variants={lineChildVariants}
            style={{ display: 'block', willChange: 'transform, opacity' }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionComponent>
  );
}

export interface AnimatedCharactersProps {
  text: string;
  className?: string;
  charClassName?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  once?: boolean;
  amount?: number | 'some' | 'all';
  as?: ElementType;
}

const charsContainerVariants: Variants = {
  hidden: {},
  visible: (custom = {}) => ({
    transition: {
      staggerChildren: custom.stagger ?? 0.045,
      delayChildren: custom.delay ?? 0,
    },
  }),
};

const charChildVariants: Variants = {
  hidden: {
    opacity: 0,
    y: '105%',
    scaleY: 1.15,
  },
  visible: (custom = {}) => ({
    opacity: 1,
    y: '0%',
    scaleY: 1,
    transition: {
      duration: custom.duration ?? 0.8,
      ease: EASINGS.power4Out,
    },
  }),
};

export function AnimatedCharacters({
  text,
  className = '',
  charClassName = '',
  delay = 0,
  stagger = 0.04,
  duration = 0.8,
  once = true,
  amount = 0.2,
  as: Component = 'span',
}: AnimatedCharactersProps) {
  const shouldReduceMotion = useReducedMotion();
  const chars = Array.from(text);

  if (shouldReduceMotion) {
    return <Component className={className}>{text}</Component>;
  }

  const MotionComponent = motion.create(Component);

  return (
    <MotionComponent
      className={`animated-chars-container ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      custom={{ delay, stagger }}
      variants={charsContainerVariants}
      style={{ display: 'inline-block' }}
    >
      {chars.map((ch, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            verticalAlign: 'bottom',
            paddingBottom: '0.04em',
          }}
        >
          <motion.span
            className={charClassName}
            custom={{ duration }}
            variants={charChildVariants}
            style={{
              display: 'inline-block',
              willChange: 'transform, opacity',
              whiteSpace: ch === ' ' ? 'pre' : 'normal',
            }}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </motion.span>
        </span>
      ))}
    </MotionComponent>
  );
}

/* =========================================================================
   GENERIC REVEAL & STAGGER CONTAINERS
   ========================================================================= */

export interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  delay?: number;
  duration?: number;
  y?: number;
  once?: boolean;
  amount?: number | 'some' | 'all';
  children?: ReactNode;
}

const revealVariants: Variants = {
  hidden: (custom = {}) => ({
    opacity: 0,
    y: custom.y ?? 42,
    clipPath: 'inset(12% 0 0 0)',
  }),
  visible: (custom = {}) => ({
    opacity: 1,
    y: 0,
    clipPath: 'inset(0% 0 0 0)',
    transition: {
      duration: custom.duration ?? 0.85,
      delay: custom.delay ?? 0,
      ease: EASINGS.power4Out,
    },
  }),
};

export const Reveal = forwardRef<HTMLDivElement, RevealProps>(function Reveal(
  {
    children,
    className = '',
    delay = 0,
    duration = 0.85,
    y = 42,
    once = true,
    amount = 0.18,
    ...props
  },
  ref
) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    const {
      style,
      id,
      role,
      'aria-label': ariaLabel,
      'aria-hidden': ariaHidden,
    } = props as Record<string, unknown>;
    return (
      <div
        ref={ref}
        className={`reveal ${className}`}
        style={style as React.CSSProperties | undefined}
        id={id as string | undefined}
        role={role as string | undefined}
        aria-label={ariaLabel as string | undefined}
        aria-hidden={ariaHidden as boolean | undefined}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={`reveal ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      custom={{ delay, duration, y }}
      variants={revealVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
});

export interface TextRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  once?: boolean;
  amount?: number | 'some' | 'all';
  as?: ElementType;
}

export function TextReveal({
  children,
  className = '',
  delay = 0,
  duration = 0.85,
  once = true,
  amount = 0.2,
  as: Component = 'div',
}: TextRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <Component className={className}>{children}</Component>;
  }

  const MotionComponent = motion.create(Component);

  return (
    <MotionComponent
      className={className}
      initial={{ opacity: 0, y: 36, clipPath: 'inset(16% 0 0 0)' }}
      whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASINGS.power4Out }}
    >
      {children}
    </MotionComponent>
  );
}

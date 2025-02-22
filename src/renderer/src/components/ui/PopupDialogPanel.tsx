import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import clsx from "clsx"
import { AnimatePresence, motion, Variants } from "motion/react"

const WRAPPER_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

const POPUP_VARIANTS: Variants = {
  initial: { scale: 0.8 },
  animate: { scale: 1 },
  exit: { scale: 0.8 }
}

function PopupDialogPanel({
  children,
  title,
  isOpen,
  close,
  maxWidth = true,
  bgDark = true
}: {
  children: React.ReactElement
  title: JSX.Element | string
  isOpen: boolean
  close: (value: boolean) => void
  maxWidth?: boolean
  bgDark?: boolean
}): JSX.Element {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog static open={isOpen} onClose={close} className="w-full h-full absolute top-0 left-0 z-200 flex justify-center items-center select-none bg-zinc">
          <motion.div
            variants={WRAPPER_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            className={clsx(
              "relative w-full h-full flex flex-col justify-center items-center rounded-md bg-image-vs bg-center bg-cover",
              "before:absolute before:left-0 before:top-0 before:w-full before:h-full before:backdrop-blur-[2px] before:bg-zinc-950/25"
            )}
          >
            <motion.div
              variants={POPUP_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              className={clsx(
                "relative flex flex-col justify-center items-center rounded-md p-2",
                "before:absolute before:left-0 before:top-0 before:w-full before:h-full before:rounded-md before:backdrop-blur-sm before:bg-zinc-950/25 before:shadow-sm before:shadow-zinc-950/50 before:border before:border-zinc-400/5"
              )}
            >
              <DialogPanel
                className={clsx(
                  "relative flex flex-col gap-4 text-center p-6 rounded-lg backdrop-blur-x",
                  bgDark && "bg-zinc-950/50 border border-zinc-400/5 group overflow-hidden group shadow-sm shadow-zinc-950/50",
                  maxWidth && "max-w-[600px]"
                )}
              >
                <>
                  <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
                  {children}
                </>
              </DialogPanel>
            </motion.div>
          </motion.div>
        </Dialog>
      )}
    </AnimatePresence>
  )
}

;("w-full rounded-sm backdrop-blur-xs bg-zinc-950/50 border border-zinc-400/5 group overflow-hidden group shadow-sm shadow-zinc-950/50 hover:shadow-none duration-200")

export default PopupDialogPanel

"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useResponsive } from "@/lib/hooks/useResponsive";
import type { LayoutType } from "@/lib/contexts/layout-context";

interface ResponsiveCanvasCarouselProps {
  slots: string[];
  layout: LayoutType;
  renderSlot: (slotId: string) => React.ReactNode;
  filledSlots: Set<string>;
  onEmptySlotTap?: () => void;
}

/**
 * For mobile layouts (mobile-1 through mobile-4), all slots fit on 1 page.
 * For desktop layouts viewed on mobile/tablet, group into pages of max 3.
 */
function groupSlotsIntoPages(
  slots: string[],
  layout: LayoutType
): string[][] {
  // Mobile layouts: all slots on a single page (they're designed to fit)
  if (layout.startsWith("mobile-")) {
    return [slots];
  }

  // Desktop layouts on mobile/tablet: paginate
  switch (layout) {
    case "focus":
    case "kanban":
      return [slots.slice(0, 3)];
    case "grid-4":
      return [slots.slice(0, 2), slots.slice(2, 4)];
    case "grid-5":
    case "asymmetric":
      return [slots.slice(0, 3), slots.slice(3, 5)];
    case "grid-6":
      return [slots.slice(0, 3), slots.slice(3, 6)];
    default: {
      const pages: string[][] = [];
      for (let i = 0; i < slots.length; i += 3) {
        pages.push(slots.slice(i, i + 3));
      }
      return pages;
    }
  }
}

export default function ResponsiveCanvasCarousel({
  slots,
  layout,
  renderSlot,
  filledSlots,
  onEmptySlotTap,
}: ResponsiveCanvasCarouselProps) {
  const { isMobile, isTablet } = useResponsive();
  const pages = groupSlotsIntoPages(slots, layout);
  const isMobileLayout = layout.startsWith("mobile-");

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    watchDrag: pages.length > 1,
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentPage(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Reset to page 0 when layout changes
  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(0);
    }
  }, [layout, emblaApi]);

  return (
    <div className="w-full flex flex-col h-full">
      {/* Carousel area */}
      <div className="flex-1 min-h-0 relative">
        {/* Navigation arrows — tablet only, multi-page only */}
        {isTablet && pages.length > 1 && (
          <>
            <AnimatePresence>
              {canScrollPrev && (
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  onClick={scrollPrev}
                  className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {canScrollNext && (
                <motion.button
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  onClick={scrollNext}
                  className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </>
        )}

        {/* Embla viewport */}
        <div ref={emblaRef} className="overflow-hidden h-full">
          <div className="flex h-full">
            {pages.map((pageSlots, pageIndex) => (
              <div
                key={pageIndex}
                className="flex-[0_0_100%] min-w-0 h-full px-2"
              >
                <PageLayout
                  pageSlots={pageSlots}
                  layout={layout}
                  renderSlot={renderSlot}
                  filledSlots={filledSlots}
                  onEmptySlotTap={onEmptySlotTap}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination — only show if multiple pages */}
      {pages.length > 1 && (
        <CanvasPagination
          totalPages={pages.length}
          currentPage={currentPage}
          onPageChange={scrollTo}
          pages={pages}
          filledSlots={filledSlots}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}

// -- Page Layout: adapts grid based on layout type and slot count --
interface PageLayoutProps {
  pageSlots: string[];
  layout: LayoutType;
  renderSlot: (slotId: string) => React.ReactNode;
  filledSlots: Set<string>;
  onEmptySlotTap?: () => void;
}

function PageLayout({
  pageSlots,
  layout,
  renderSlot,
  filledSlots,
  onEmptySlotTap,
}: PageLayoutProps) {
  const count = pageSlots.length;

  // Mobile-specific layouts with square canvases
  if (layout === "mobile-1") {
    return (
      <div className="h-full flex items-center justify-center p-2">
        <div className="w-full max-w-[min(100%,70vh)] aspect-square mx-auto">
          <SlotRenderer
            slotId={pageSlots[0]}
            renderSlot={renderSlot}
            filled={filledSlots.has(pageSlots[0])}
            onEmptySlotTap={onEmptySlotTap}
          />
        </div>
      </div>
    );
  }

  if (layout === "mobile-2") {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2 p-2">
        {pageSlots.map((slotId) => (
          <div
            key={slotId}
            className="w-full flex-1 min-h-0 flex items-center justify-center"
          >
            <div className="w-full h-full max-h-full aspect-square max-w-[min(100%,calc(50vh-1rem))] mx-auto">
              <SlotRenderer
                slotId={slotId}
                renderSlot={renderSlot}
                filled={filledSlots.has(slotId)}
                onEmptySlotTap={onEmptySlotTap}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (layout === "mobile-3") {
    return (
      <div className="h-full flex flex-col gap-2 p-1">
        {/* Top: 1 wide canvas */}
        <div className="flex-1 min-h-0 flex items-center justify-center">
          <div className="w-full h-full max-w-[min(100%,calc(50vh-1rem))] aspect-square mx-auto">
            <SlotRenderer
              slotId={pageSlots[0]}
              renderSlot={renderSlot}
              filled={filledSlots.has(pageSlots[0])}
              onEmptySlotTap={onEmptySlotTap}
            />
          </div>
        </div>
        {/* Bottom: 2 side-by-side canvases */}
        <div className="flex-1 min-h-0 grid grid-cols-2 gap-2">
          {pageSlots.slice(1).map((slotId) => (
            <div key={slotId} className="flex items-center justify-center">
              <div className="w-full h-full aspect-square max-w-full max-h-full">
                <SlotRenderer
                  slotId={slotId}
                  renderSlot={renderSlot}
                  filled={filledSlots.has(slotId)}
                  onEmptySlotTap={onEmptySlotTap}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "mobile-4") {
    return (
      <div className="h-full grid grid-cols-2 grid-rows-2 gap-2 p-1">
        {pageSlots.map((slotId) => (
          <div key={slotId} className="flex items-center justify-center min-h-0 min-w-0">
            <div className="w-full h-full aspect-square max-w-full max-h-full">
              <SlotRenderer
                slotId={slotId}
                renderSlot={renderSlot}
                filled={filledSlots.has(slotId)}
                onEmptySlotTap={onEmptySlotTap}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback for desktop layouts on mobile/tablet (non mobile-* layouts)
  // 1 canvas: centered
  if (count === 1) {
    return (
      <div className="h-full flex items-center justify-center p-2">
        <div className="w-full max-h-full" style={{ height: "min(100%, 70vh)" }}>
          <SlotRenderer
            slotId={pageSlots[0]}
            renderSlot={renderSlot}
            filled={filledSlots.has(pageSlots[0])}
            onEmptySlotTap={onEmptySlotTap}
          />
        </div>
      </div>
    );
  }

  // 2 canvases: stacked
  if (count === 2) {
    return (
      <div className="h-full grid grid-rows-2 gap-2 p-1">
        {pageSlots.map((slotId) => (
          <div key={slotId} className="min-h-0 overflow-hidden">
            <SlotRenderer
              slotId={slotId}
              renderSlot={renderSlot}
              filled={filledSlots.has(slotId)}
              onEmptySlotTap={onEmptySlotTap}
            />
          </div>
        ))}
      </div>
    );
  }

  // 3 canvases: 1 top + 2 bottom
  return (
    <div className="h-full grid grid-rows-2 gap-2 p-1">
      <div className="min-h-0 overflow-hidden">
        <SlotRenderer
          slotId={pageSlots[0]}
          renderSlot={renderSlot}
          filled={filledSlots.has(pageSlots[0])}
          onEmptySlotTap={onEmptySlotTap}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 min-h-0">
        {pageSlots.slice(1).map((slotId) => (
          <div key={slotId} className="min-h-0 overflow-hidden">
            <SlotRenderer
              slotId={slotId}
              renderSlot={renderSlot}
              filled={filledSlots.has(slotId)}
              onEmptySlotTap={onEmptySlotTap}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// -- Slot Renderer --
interface SlotRendererProps {
  slotId: string;
  renderSlot: (slotId: string) => React.ReactNode;
  filled: boolean;
  onEmptySlotTap?: () => void;
}

function SlotRenderer({
  slotId,
  renderSlot,
  filled,
  onEmptySlotTap,
}: SlotRendererProps) {
  if (filled) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="h-full w-full"
      >
        {renderSlot(slotId)}
      </motion.div>
    );
  }

  return <EmptySlotCard slotId={slotId} renderSlot={renderSlot} onTap={onEmptySlotTap} />;
}

// -- Empty Slot Card --
interface EmptySlotCardProps {
  slotId: string;
  renderSlot: (slotId: string) => React.ReactNode;
  onTap?: () => void;
}

function EmptySlotCard({ slotId, renderSlot, onTap }: EmptySlotCardProps) {
  return (
    <div className="h-full w-full relative" onClick={onTap}>
      <div className="h-full w-full [&_span]:hidden">
        {renderSlot(slotId)}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-10 h-10 rounded-xl border-2 border-dashed border-white/15 bg-white/5 backdrop-blur-sm flex items-center justify-center mb-1.5"
        >
          <Plus className="w-4 h-4 text-white/25" />
        </motion.div>
        <p className="text-white/20 text-[10px] font-medium">Drop widget</p>
      </div>
    </div>
  );
}

// -- Pagination Component --
interface CanvasPaginationProps {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  pages: string[][];
  filledSlots: Set<string>;
  isMobile: boolean;
}

function CanvasPagination({
  totalPages,
  currentPage,
  onPageChange,
  pages,
  filledSlots,
  isMobile,
}: CanvasPaginationProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-2 px-4 shrink-0">
      <div className="bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-white/60 tabular-nums">
        {currentPage + 1} / {totalPages}
      </div>

      <div className="flex items-center gap-2">
        {pages.map((pageSlots, index) => {
          const isActive = index === currentPage;
          const hasWidget = pageSlots.some((s) => filledSlots.has(s));

          return (
            <button
              key={index}
              onClick={() => onPageChange(index)}
              className="relative p-1"
              aria-label={`Go to page ${index + 1}`}
            >
              <motion.div
                animate={{
                  scale: isActive ? 1 : 0.75,
                  opacity: isActive ? 1 : 0.5,
                }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className={`rounded-full transition-colors duration-200 ${
                  isActive
                    ? "w-6 h-2.5 bg-cyan-400"
                    : hasWidget
                    ? "w-2.5 h-2.5 bg-white/50"
                    : "w-2.5 h-2.5 border border-white/30 bg-transparent"
                }`}
              />
            </button>
          );
        })}
      </div>

      {isMobile && currentPage === 0 && totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-white/30 text-xs"
        >
          Swipe →
        </motion.div>
      )}
    </div>
  );
}

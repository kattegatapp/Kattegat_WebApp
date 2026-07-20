"use client";

import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useEffect, useState } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    image: "/assets/landing-slides/live-drummer.jpg",
    alt: "Live drummer performing at a Dubai venue",
    label: "Live musicians",
    position: "object-[58%_22%] lg:object-[62%_20%]",
  },
  {
    image: "/assets/landing-slides/live-vocalist.jpg",
    alt: "Vocalist performing live in Dubai",
    label: "Vocalists & hosts",
    position: "object-[54%_20%] lg:object-[60%_18%]",
  },
  {
    image: "/assets/landing-slides/live-guitarist.jpg",
    alt: "Guitarist ready to perform at a Dubai venue",
    label: "Solo performers",
    position: "object-[52%_22%] lg:object-[60%_20%]",
  },
  {
    image: "/assets/landing-slides/live-dj.jpg",
    alt: "DJ performing a live set in Dubai",
    label: "DJs & live sets",
    position: "object-[52%_22%] lg:object-[60%_20%]",
  },
] as const;

export function HeroCarousel({ className }: { className?: string }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [autoplay] = useState(() =>
    Autoplay({ delay: 4800, stopOnInteraction: false }),
  );

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  return (
    <div
      className={cn(
        "relative h-screen min-h-screen w-full overflow-hidden rounded-[1.75rem] bg-brand-forest sm:rounded-[2rem]",
        className,
      )}
    >
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        plugins={[autoplay]}
        style={{ height: "100dvh", minHeight: "100dvh" }}
        className="h-screen min-h-screen w-full [&_[data-slot=carousel-content]]:h-[100dvh] [&_[data-slot=carousel-content]]:min-h-[100dvh] [&_[data-slot=carousel-content]>div]:h-[100dvh] [&_[data-slot=carousel-content]>div]:min-h-[100dvh]"
      >
        <CarouselContent
          style={{ height: "100dvh", minHeight: "100dvh" }}
          className="ml-0 h-screen min-h-screen"
        >
          {SLIDES.map((slide, index) => (
            <CarouselItem
              key={slide.image}
              style={{ height: "100dvh", minHeight: "100dvh" }}
              className="relative h-screen min-h-screen basis-full overflow-hidden pl-0"
            >
              <Image
                src={slide.image}
                alt={slide.alt}
                width={1800}
                height={2400}
                priority={index === 0}
                loading="eager"
                sizes="100vw"
                className={cn("absolute inset-0 size-full object-cover", slide.position)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious
          onClick={() => {
            api?.scrollPrev();
            autoplay.reset();
          }}
          className="left-5 top-1/2 z-40 hidden size-11 -translate-y-1/2 border-white/30 bg-black/45 text-white shadow-lg backdrop-blur-md hover:bg-black/65 hover:text-white md:flex"
        />
        <CarouselNext
          onClick={() => {
            api?.scrollNext();
            autoplay.reset();
          }}
          className="right-5 top-1/2 z-40 hidden size-11 -translate-y-1/2 border-white/30 bg-black/45 text-white shadow-lg backdrop-blur-md hover:bg-black/65 hover:text-white md:flex"
        />
      </Carousel>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"
      />

      <div className="absolute inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 p-4 sm:p-5">
        <span className="rounded-full bg-black/40 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white backdrop-blur-md">
          {SLIDES[current]?.label}
        </span>
        <div className="flex items-center gap-1.5">
          {SLIDES.map((slide, index) => (
            <button
              key={slide.image}
              type="button"
              aria-label={`Go to ${slide.label}`}
              aria-current={current === index}
              onClick={() => {
                api?.scrollTo(index);
                autoplay.reset();
              }}
              className={cn(
                "h-1.5 rounded-full transition-all",
                current === index ? "w-6 bg-brand-mantis" : "w-1.5 bg-white/50 hover:bg-white/80",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

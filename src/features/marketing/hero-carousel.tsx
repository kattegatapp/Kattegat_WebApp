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
    image: "/assets/hero-slides/hero-vocalist.png",
    alt: "Live vocalist performing at a Dubai rooftop lounge",
    label: "Live vocalists",
  },
  {
    image: "/assets/hero-slides/hero-dj-saxophone.png",
    alt: "DJ and saxophonist above the Dubai skyline",
    label: "DJs & live sets",
  },
  {
    image: "/assets/hero-slides/hero-percussionist.png",
    alt: "Percussionist on a terrace facing the Burj Khalifa",
    label: "Percussion & bands",
  },
  {
    image: "/assets/hero-slides/hero-magician.png",
    alt: "Magician at a private event",
    label: "Signature entertainment",
  },
  {
    image: "/assets/hero-slides/hero-harpist.png",
    alt: "Harpist in an elegant skyline lounge",
    label: "Elegant live music",
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
        "relative h-full w-full overflow-hidden rounded-[1.75rem] bg-brand-forest sm:rounded-[2rem]",
        className,
      )}
    >
      <Carousel
        setApi={setApi}
        opts={{ loop: true }}
        plugins={[autoplay]}
        className="h-full w-full [&_[data-slot=carousel-content]]:h-full [&_[data-slot=carousel-content]>div]:h-full"
      >
        <CarouselContent className="ml-0 h-full">
          {SLIDES.map((slide, index) => (
            <CarouselItem key={slide.image} className="relative h-full min-h-[18rem] basis-full pl-0 sm:min-h-[24rem] lg:min-h-[32rem]">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                priority={index === 0}
                sizes="(min-width: 1280px) 1200px, 100vw"
                className="object-cover object-center"
              />
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious
          onClick={() => autoplay.reset()}
          className="left-3 top-1/2 z-20 hidden size-10 -translate-y-1/2 border-white/25 bg-black/30 text-white backdrop-blur-md hover:bg-black/45 hover:text-white sm:flex sm:left-4"
        />
        <CarouselNext
          onClick={() => autoplay.reset()}
          className="right-3 top-1/2 z-20 hidden size-10 -translate-y-1/2 border-white/25 bg-black/30 text-white backdrop-blur-md hover:bg-black/45 hover:text-white sm:flex sm:right-4"
        />
      </Carousel>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10"
      />

      <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-between gap-3 p-4 sm:p-5">
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

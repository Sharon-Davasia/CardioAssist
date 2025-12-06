import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatedSection } from "./AnimatedSection";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  organization: string;
  content: string;
  rating: number;
  avatar: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    role: "Emergency Medicine Director",
    organization: "Metro General Hospital",
    content: "CardioAssist has reduced our triage time by 40%. The AI risk scoring is incredibly accurate and helps us prioritize critical cases instantly.",
    rating: 5,
    avatar: "SC",
  },
  {
    id: 2,
    name: "Michael Rodriguez, RN",
    role: "Charge Nurse",
    organization: "City Medical Center",
    content: "The voice input feature is a game-changer for busy shifts. I can complete intake forms while attending to patients without missing critical data.",
    rating: 5,
    avatar: "MR",
  },
  {
    id: 3,
    name: "Dr. Emily Thompson",
    role: "Chief Medical Officer",
    organization: "Regional Health Network",
    content: "The privacy-first architecture gave us confidence to deploy. All data stays in our Snowflake environment - exactly what HIPAA compliance requires.",
    rating: 5,
    avatar: "ET",
  },
  {
    id: 4,
    name: "James Park, NP",
    role: "Nurse Practitioner",
    organization: "Urgent Care Associates",
    content: "The real-time alerts have helped us catch several critical cases that might have been missed. It's like having an extra set of expert eyes.",
    rating: 5,
    avatar: "JP",
  },
];

export function TestimonialsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  return (
    <section className="container mx-auto px-4 py-20">
      <AnimatedSection animation="fade-up">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            What Healthcare Professionals Say
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Trusted by emergency departments and healthcare facilities worldwide
          </p>
        </div>
      </AnimatedSection>

      <div className="max-w-4xl mx-auto relative">
        {/* Carousel Container */}
        <div className="overflow-hidden rounded-3xl">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="w-full flex-shrink-0 px-4"
              >
                <div className="card-glass p-8 md:p-12 relative">
                  {/* Quote Icon */}
                  <Quote className="absolute top-6 right-6 h-12 w-12 text-primary/10" />
                  
                  {/* Rating */}
                  <div className="flex gap-1 mb-6">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Content */}
                  <p className="text-lg md:text-xl text-foreground leading-relaxed mb-8 italic">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      <div className="text-sm text-primary">{testimonial.organization}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border-border hover:bg-background"
          onClick={goToPrevious}
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 rounded-full bg-background/80 backdrop-blur-sm shadow-lg border-border hover:bg-background"
          onClick={goToNext}
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "bg-primary w-8"
                  : "bg-primary/30 hover:bg-primary/50"
              )}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

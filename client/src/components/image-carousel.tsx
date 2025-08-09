import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import engineImage from "@assets/3D-printed-prototype-of-car-engine-printed-on-d-printer-from-molten-white-plastic-on-working-surface-sbweston_1754750512360.webp";
import partsImage from "@assets/Picture3-1_1754750512374.webp";
import printerImage from "@assets/shutterstock_1017980959-1_1754750512376.jpg";

const images = [
  {
    src: engineImage,
    alt: "3D printed car engine prototype on printer bed"
  },
  {
    src: partsImage,
    alt: "Collection of precision 3D printed mechanical parts and prototypes"
  },
  {
    src: printerImage,
    alt: "Modern 3D printer creating a blue spiral object with purple lighting"
  }
];

export default function ImageCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = images.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <img 
                src={image.src} 
                alt={image.alt} 
                className="w-full h-80 object-cover rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        onClick={prevSlide}
        variant="ghost"
        size="sm"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-dark-accent/80 hover:bg-cyan-dark text-text-primary p-2 rounded-full transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        onClick={nextSlide}
        variant="ghost"
        size="sm"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-dark-accent/80 hover:bg-cyan-dark text-text-primary p-2 rounded-full transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Dots Indicator */}
      <div className="flex justify-center mt-4 space-x-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${
              index === currentSlide ? 'bg-cyan-primary' : 'bg-dark-accent'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

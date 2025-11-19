import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-banner-carousel',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './banner-carousel.component.html',
    styleUrls: ['./banner-carousel.component.scss']
})
export class BannerCarouselComponent implements OnInit, OnDestroy {
    currentSlide = 0;
    private autoPlayInterval: any;

    banners: Array<{ image: string, title?: string, subtitle?: string }> = [
        {
            image: 'assets/images/banner1.png'
        },
        {
            image: 'assets/images/banner2.png',
        },
        {
            image: 'assets/images/banner1.png',
        }
    ];

    ngOnInit() {
        // Iniciar autoplay após um pequeno delay para estabilizar o layout
        setTimeout(() => {
            this.startAutoPlay();
        }, 1000);
    }

    ngOnDestroy() {
        this.stopAutoPlay();
    }

    startAutoPlay() {
        // Limpar qualquer interval anterior
        this.stopAutoPlay();

        // Usar requestAnimationFrame para melhor performance
        this.autoPlayInterval = setInterval(() => {
            requestAnimationFrame(() => {
                this.nextSlide();
            });
        }, 5000);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) {
            clearInterval(this.autoPlayInterval);
        }
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.banners.length;
    }

    prevSlide() {
        this.currentSlide = this.currentSlide === 0 ? this.banners.length - 1 : this.currentSlide - 1;
    }

    goToSlide(index: number) {
        this.currentSlide = index;
    }

    onMouseEnter() {
        this.stopAutoPlay();
    }

    onMouseLeave() {
        this.startAutoPlay();
    }
}

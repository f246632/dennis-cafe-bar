/**
 * Dennis Café Bar - Gallery & Lightbox
 * Handles image gallery interactions and lightbox functionality
 */

document.addEventListener('DOMContentLoaded', function() {

    // ============================================
    // Gallery Configuration
    // ============================================

    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');
    const lightboxCaption = document.getElementById('lightboxCaption');

    let currentIndex = 0;
    const images = [];

    // ============================================
    // Initialize Gallery
    // ============================================

    // Collect all images
    galleryItems.forEach((item, index) => {
        const img = item.querySelector('img');
        if (img) {
            images.push({
                src: img.src,
                alt: img.alt || `Dennis Café Bar - Image ${index + 1}`,
                index: index
            });

            // Add click event to open lightbox
            item.addEventListener('click', function() {
                openLightbox(index);
            });

            // Add keyboard accessibility
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-label', `View image ${index + 1}`);

            item.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openLightbox(index);
                }
            });
        }
    });

    // ============================================
    // Lightbox Functions
    // ============================================

    function openLightbox(index) {
        currentIndex = index;
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        // Focus on close button for accessibility
        lightboxClose.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }

    function updateLightboxImage() {
        if (images[currentIndex]) {
            const imageData = images[currentIndex];
            lightboxImage.src = imageData.src;
            lightboxImage.alt = imageData.alt;
            lightboxCaption.textContent = imageData.alt;

            // Fade in effect
            lightboxImage.style.opacity = '0';
            setTimeout(() => {
                lightboxImage.style.transition = 'opacity 0.3s ease';
                lightboxImage.style.opacity = '1';
            }, 50);
        }
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % images.length;
        updateLightboxImage();
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        updateLightboxImage();
    }

    // ============================================
    // Event Listeners
    // ============================================

    // Close button
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    // Previous button
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', function(e) {
            e.stopPropagation();
            showPrev();
        });
    }

    // Next button
    if (lightboxNext) {
        lightboxNext.addEventListener('click', function(e) {
            e.stopPropagation();
            showNext();
        });
    }

    // Click outside image to close
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;

        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                showPrev();
                break;
            case 'ArrowRight':
                showNext();
                break;
        }
    });

    // ============================================
    // Touch/Swipe Support for Mobile
    // ============================================

    let touchStartX = 0;
    let touchEndX = 0;

    if (lightbox) {
        lightbox.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - show next
                showNext();
            } else {
                // Swipe right - show previous
                showPrev();
            }
        }
    }

    // ============================================
    // Preload Adjacent Images
    // ============================================

    function preloadAdjacentImages() {
        if (!lightbox.classList.contains('active')) return;

        const nextIndex = (currentIndex + 1) % images.length;
        const prevIndex = (currentIndex - 1 + images.length) % images.length;

        // Preload next image
        if (images[nextIndex]) {
            const nextImg = new Image();
            nextImg.src = images[nextIndex].src;
        }

        // Preload previous image
        if (images[prevIndex]) {
            const prevImg = new Image();
            prevImg.src = images[prevIndex].src;
        }
    }

    // Preload when image changes
    lightboxImage.addEventListener('load', preloadAdjacentImages);

    // ============================================
    // Gallery Grid Animation on Scroll
    // ============================================

    function animateGalleryItems() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, index * 50); // Stagger animation

                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        galleryItems.forEach((item) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(item);
        });
    }

    // Initialize gallery animations
    if (galleryItems.length > 0) {
        animateGalleryItems();
    }

    // ============================================
    // Image Loading Progress
    // ============================================

    function checkImagesLoaded() {
        const galleryImages = document.querySelectorAll('.gallery-item img');
        let loadedCount = 0;
        const totalImages = galleryImages.length;

        galleryImages.forEach(img => {
            if (img.complete) {
                loadedCount++;
            } else {
                img.addEventListener('load', function() {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        console.log('All gallery images loaded successfully');
                    }
                });

                img.addEventListener('error', function() {
                    console.error('Failed to load image:', this.src);
                    // Replace with placeholder or hide
                    this.style.display = 'none';
                });
            }
        });

        if (loadedCount === totalImages) {
            console.log('All gallery images loaded successfully');
        }
    }

    checkImagesLoaded();

    // ============================================
    // Accessibility: Announce to Screen Readers
    // ============================================

    function announceImageChange() {
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.style.cssText = 'position: absolute; left: -10000px; width: 1px; height: 1px; overflow: hidden;';
        announcement.textContent = `Showing image ${currentIndex + 1} of ${images.length}`;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Call announcement when image changes
    lightboxPrev.addEventListener('click', announceImageChange);
    lightboxNext.addEventListener('click', announceImageChange);

    // ============================================
    // Console Info
    // ============================================

    console.log(`Gallery initialized with ${images.length} images`);
});

$(document).ready(function () {

    // Loader Logic
    let progress = 0;
    const interval = setInterval(function () {
        progress += Math.random() * 10;
        if (progress > 100) progress = 100;
        $('.progress-fill').css('width', progress + '%');

        if (progress === 100) {
            clearInterval(interval);
            setTimeout(function () {
                $('.loading-text').text('Synchronization Complete!');
                setTimeout(function () {
                    $('#isekai-loader').fadeOut(1000, function () {
                        $('#main-content').removeClass('d-none').hide().fadeIn(1000);
                        // Trigger hero animations
                        $('.hero-panel').addClass('animate__animated animate__fadeInLeft');
                    });
                }, 500);
            }, 500);
        }
    }, 200);

    // Navbar Scroll Effect
    $(window).scroll(function () {
        if ($(this).scrollTop() > 50) {
            $('.isekai-nav').addClass('shadow-sm');
        } else {
            $('.isekai-nav').removeClass('shadow-sm');
        }
    });

    // Smooth Scrolling
    $('a[href^="#"]').on('click', function (event) {
        var target = $(this.getAttribute('href'));
        if (target.length) {
            event.preventDefault();
            $('html, body').stop().animate({
                scrollTop: target.offset().top - 70
            }, 1000);
        }
    });

    // Quest Board Hover Effect (Optional JS enhancement)
    $('.quest-paper').hover(
        function () {
            $(this).find('.pin').css('background', '#ff5f56');
        }, function () {
            $(this).find('.pin').css('background', '#d32f2f');
        }
    );

    // Intersection Observer for Scroll Animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                $(entry.target).addClass('animate-in');
            }
        });
    });

    // Add animation class to sections
    $('section').each(function () {
        observer.observe(this);
    });
    // Sakura Rain Logic
    function createSakura() {
        const sakura = document.createElement('div');
        sakura.classList.add('sakura');

        // Random Properties
        const size = Math.random() * 10 + 5 + 'px'; // 5px to 15px
        const left = Math.random() * 100 + 'vw';
        const fallDuration = Math.random() * 5 + 5 + 's'; // 5s to 10s
        const swayDuration = Math.random() * 2 + 2 + 's'; // 2s to 4s

        $(sakura).css({
            'width': size,
            'height': size,
            'left': left,
            'animation-duration': `${fallDuration}, ${swayDuration}`
        });

        $('#sakura-container').append(sakura);

        // Remove after animation completes (max 10s)
        setTimeout(() => {
            $(sakura).remove();
        }, 10000);
    }

    // Start Rain
    setInterval(createSakura, 200);

    // Job Board Form Handling
    $('#guild-job-form').on('submit', function (e) {
        e.preventDefault();
        const btn = $(this).find('.btn-stamp');
        const originalText = btn.html();

        // Add stamp effect
        btn.addClass('stamped').css({
            'background': '#d63031',
            'color': '#fff',
            'border-color': '#d63031'
        }).html('<i class="fas fa-check"></i> QUEST POSTED');

        // Reset form
        setTimeout(() => {
            this.reset();
            btn.removeClass('stamped').css({
                'background': '',
                'color': '',
                'border-color': ''
            }).html(originalText);
            alert("Your job request has been posted to the Guild Board! (Simulation)");
        }, 2000);
    });

});

// Bounty Board Interaction
function acceptQuest(btn, url) {
    // 1. Stamp Effect
    $(btn).addClass('stamped');

    // 2. Paper Animation (Take Quest)
    const paper = $(btn).closest('.quest-paper');
    setTimeout(() => {
        paper.addClass('quest-accepted-anim');
    }, 400); // Wait for stamp

    // 3. Redirect
    setTimeout(() => {
        window.open(url, '_blank');
        // Reset for demo purposes
        setTimeout(() => {
            $(btn).removeClass('stamped');
            paper.removeClass('quest-accepted-anim');
        }, 2000);
    }, 1000); // Wait for animation
}

// Add your javascript here
// Don't forget to add it into respective layouts where this js file is needed

$(document).ready(function() {
  AOS.init( {
    // uncomment below for on-scroll animations to played only once
    // once: true  
  }); // initialize animate on scroll library
});

// Smooth scroll for links with hashes
$('a.smooth-scroll')
.click(function(event) {
  // On-page links
  if (
    location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') 
    && 
    location.hostname == this.hostname
  ) {
    // Figure out element to scroll to
    var target = $(this.hash);
    target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
    // Does a scroll target exist?
    if (target.length) {
      // Only prevent default if animation is actually gonna happen
      event.preventDefault();
      $('html, body').animate({
        scrollTop: target.offset().top
      }, 1000, function() {
        // Callback after animation
        // Must change focus!
        var $target = $(target);
        $target.focus();
        if ($target.is(":focus")) { // Checking if the target was focused
          return false;
        } else {
          $target.attr('tabindex','-1'); // Adding tabindex for elements not focusable
          $target.focus(); // Set focus again
        };
      });
    }
  }
});


// Custom form validation
$(document).on('submit', '#contact form', function(event) {
  var form = this;
  var fields = form.querySelectorAll('input[required], textarea[required]');

  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];

    if (!field.value.trim()) {
      event.preventDefault();
      var label = field.getAttribute('placeholder') || 'این قسمت';
      alert('لطفاً «' + label + '» را پر کنید.');
      field.focus();
      return false;
    }

    if (field.type === 'email') {
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(field.value.trim())) {
        event.preventDefault();
        alert('لطفاً یک ایمیل معتبر وارد کنید.');
        field.focus();
        return false;
      }
    }
  }
});

// Close the mobile menu when the user clicks outside it.
$(document).on('click', function(event) {
  var navbar = $('.navbar');
  var navigation = $('#navigation');
  var toggler = $('.navbar-toggler');

  if (
    window.innerWidth <= 991 &&
    navigation.hasClass('show') &&
    navigation.length &&
    !navigation.is(event.target) &&
    navigation.has(event.target).length === 0 &&
    !toggler.is(event.target) &&
    toggler.has(event.target).length === 0
  ) {
    toggler.trigger('click');
  }
});

// Close the mobile menu after choosing a navigation item.
$(document).on('click', '#navigation .nav-link.smooth-scroll', function() {
  if (window.innerWidth <= 991 && $('#navigation').hasClass('show')) {
    $('.navbar-toggler').trigger('click');
  }
});

// Mobile "back" button: close the menu and return to the top.
$(document).on('click', '#mobileBackButton', function(event) {
  event.preventDefault();

  if (window.innerWidth <= 991 && $('#navigation').hasClass('show')) {
    $('.navbar-toggler').trigger('click');
  }

  $('html, body').animate({ scrollTop: 0 }, 600);
});

// Confirm after the contact form is sent (contact.php redirects with ?sent=1)
if (location.search.indexOf('sent=1') > -1) {
  alert('پیام شما ارسال شد. ممنون!');
  history.replaceState(null, '', location.pathname + location.hash);
}

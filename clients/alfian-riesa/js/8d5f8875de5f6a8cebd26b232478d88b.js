$(document).ready(function () {
  var commentContainer = $("#rsvp-data-container");
  var language = rsvpSettings.language;
  var showGuestCountOnRsvpOptions = rsvpSettings.show_guest_count_on_rsvp_options.split("|");
  var confirmationTextColor = rsvpSettings.confirmation_text_color;
  var isGuestNameEditable = rsvpSettings.is_guest_name_editable === "yes";
  var isWishesOnly = rsvpSettings.is_wishes_only === "yes";
  var isUsingRadioButton = rsvpSettings.is_using_radio_button === "yes";
  var maxGuest = $("#guest-data").data("max-guest") || rsvpSettings.default_max_guest;
  var guestName = getGuestNameFromQuery() || $("#guest-data").data("name");
  var invitationID = rsvpSettings.invitation_id;

  var allComments = [];
  var currentPage = 1;
  var itemsPerPage = 4;

  var db = initFirebase();
  applyGuestNameToPage();

  $(".elementor-field-group-guestcount").hide();

  if (isUsingRadioButton) {
    $(".elementor-field-group-attendance_select").hide();
  } else {
    $(".elementor-field-group-attendance_radio").hide();
  }

  if (isWishesOnly) {
    $(".elementor-field-group-attendance_radio").hide();
    $(".elementor-field-group-attendance_select").hide();
    $(".elementor-field-group-guestcount").hide();
  }

  var errMsg = isWishesOnly
    ? language === "en" ? "Please enter your wishes" : "Teks harus diisi"
    : language === "en" ? "Please select your attendance" : "Kehadiran harus diisi";

  $('<div class="noticeConfirm">' + errMsg + "</div>").insertAfter(".elementor-form-fields-wrapper");

  var checkMark = '<svg width="14px" height="11px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="checkmark" preserveAspectRatio="xMidYMid meet" fill="' + confirmationTextColor + '"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><path fill="' + confirmationTextColor + '" d="M34.459 1.375a2.999 2.999 0 0 0-4.149.884L13.5 28.17l-8.198-7.58a2.999 2.999 0 1 0-4.073 4.405l10.764 9.952s.309.266.452.359a2.999 2.999 0 0 0 4.15-.884L35.343 5.524a2.999 2.999 0 0 0-.884-4.149z"></path></g></svg>';

  var successMsg = language === "en"
    ? "&nbsp;Thank you, we have received your response!"
    : "&nbsp;Terima kasih, respon anda sudah diterima!";

  $('<div class="noticeSuccess" style="color: ' + confirmationTextColor + '">' + checkMark + successMsg + "</div>").insertAfter('form[name="RSVP"]');

  constructForm();
  fetchAndDisplayComments();

  if (!isWishesOnly) {
    function onAttendanceChange(value) {
      $(".elementor-field-group-guestcount").toggle(showGuestCountOnRsvpOptions.includes(value));
      if ($(".noticeConfirm").css("display") !== "none") {
        $(".noticeConfirm").toggle();
      }
    }

    $('input[name="form_fields[attendance_radio]"]').on("change", function () {
      onAttendanceChange($(this).val());
    });

    $("#form-field-attendance_select").on("change", function () {
      onAttendanceChange($(this).val());
    });
  }

  var elFormBtn = $(".elementor-field-type-submit button");
  if (elFormBtn.length > 0 && !elFormBtn.attr("listenerOnClick")) {
    elFormBtn.on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      submitForm();
    });
  }
  elFormBtn.attr("listenerOnClick", "true");

  function initFirebase() {
    if (!window.firebase || !window.FIREBASE_CONFIG || !window.FIREBASE_CONFIG.apiKey) {
      console.error("Firebase is not configured. Set window.FIREBASE_CONFIG in HTML.");
      return null;
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(window.FIREBASE_CONFIG);
    }

    return firebase.firestore();
  }

  function getGuestNameFromQuery() {
    try {
      var params = new URLSearchParams(window.location.search);
      var rawName = params.get("name");
      if (!rawName) return "";
      // Support links where spaces are sent as "+"
      return decodeURIComponent(rawName.replace(/\+/g, " ")).trim();
    } catch (_err) {
      return "";
    }
  }

  function applyGuestNameToPage() {
    if (!guestName) return;

    // Keep existing data source in sync for other scripts/components.
    $("#guest-data").attr("data-name", guestName);

    // Replace opening section guest label text.
    $(".elementor-heading-title").each(function () {
      var text = $(this).text().trim();
      if (text === "Guest") {
        $(this).text(guestName);
      }
    });
  }

  function submitForm() {
    if (!db) {
      $(".noticeConfirm").text("Firebase is not configured yet.").show();
      return;
    }

    var elFormName = $("#form-field-guestname").val();
    var elFormPhone = $("#form-field-phone").val();
    var elFormText = $("#form-field-wishes").val();
    var elFormAttend = $('input[name="form_fields[attendance_radio]"]:checked').val() || $("select[id=form-field-attendance_select]").val();
    var elFormCount = $("#form-field-guestcount").val();

    if (elFormName === "") return;

    if (isWishesOnly) {
      if (elFormText === "") {
        $(".noticeConfirm").show();
        return;
      }
    } else {
      if (!elFormAttend || elFormAttend === "0") {
        $(".noticeConfirm").show();
        return;
      }
    }

    var data = {
      invitation_id: String(invitationID),
      name: elFormName,
      text: elFormText || "",
      status: elFormAttend || "",
      phone: elFormPhone || "",
      guest_count: !isWishesOnly && elFormCount !== null && showGuestCountOnRsvpOptions.includes(elFormAttend)
        ? parseInt(elFormCount, 10)
        : null,
      created_at: firebase.firestore.FieldValue.serverTimestamp()
    };

    db.collection("rsvp_wishes")
      .add(data)
      .then(function () {
        $('form[name="RSVP"]').hide();
        $(".noticeSuccess").show();
        fetchAndDisplayComments();
      })
      .catch(function (error) {
        console.error("Error submitting RSVP:", error);
        $(".noticeConfirm")
          .text(language === "en" ? "Failed to submit form. Please try again." : "Gagal mengirim form. Silahkan coba lagi.")
          .show();
      });
  }

  function fetchAndDisplayComments() {
    if (!db || commentContainer.length === 0) return;

    db.collection("rsvp_wishes")
      .where("invitation_id", "==", String(invitationID))
      .get()
      .then(function (snapshot) {
        allComments = snapshot.docs
          .map(function (doc) {
            var d = doc.data();
            return {
              name: d.name || "Guest",
              text: d.text || "",
              created_at: d.created_at && d.created_at.toDate ? d.created_at.toDate().toISOString() : new Date().toISOString(),
              status: d.status || "",
              guest_count: d.guest_count,
              phone: d.phone || ""
            };
          })
          .sort(function (a, b) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          })
          .filter(function (comment) {
            return comment.text && comment.text.trim() !== "";
          });

        if (allComments.length > 0) {
          commentContainer.show();
          currentPage = 1;
          renderCommentsPage();
        } else {
          var emptyMsg = language === "en" ? "Wishes will be shown here" : "Ucapan akan ditampilkan di sini";
          commentContainer.html('<div class="rsvp-empty-state">' + emptyMsg + "</div>").show();
          $("#rsvp-pagination").hide();
        }
      })
      .catch(function (error) {
        console.error("Error fetching wishes:", error);
      });
  }

  function renderCommentsPage() {
    commentContainer.empty();

    var totalPages = Math.ceil(allComments.length / itemsPerPage);
    var start = (currentPage - 1) * itemsPerPage;
    var pageComments = allComments.slice(start, start + itemsPerPage);

    $.each(pageComments, function (_index, comment) {
      var commentDiv = $("<div>").addClass("comment");
      var nameSpan = $("<span>").addClass("name").text(comment.name);
      var textSpan = $("<span>").addClass("text").text(comment.text);

      // Add attendance status if available
      var statusHtml = "";
      if (comment.status && comment.status !== "") {
        var statusText = "";
        if (comment.status === "accepted" || comment.status === "Accepted" || comment.status === "yes" || comment.status === "Yes" || comment.status === "Y" || comment.status === "ya" || comment.status === "Ya") {
          statusText = language === "en" ? "Attending" : "Hadir";
        } else if (comment.status === "declined" || comment.status === "Declined" || comment.status === "no" || comment.status === "No" || comment.status === "N" || comment.status === "tidak" || comment.status === "Tidak") {
          statusText = language === "en" ? "Not Attending" : "Tidak Hadir";
        } else if (comment.status === "maybe" || comment.status === "Maybe" || comment.status === "mungkin" || comment.status === "Mungkin") {
          statusText = language === "en" ? "Maybe" : "Mungkin";
        } else {
          statusText = comment.status;
        }
        statusHtml = $("<span>").addClass("rsvp-status").text(" (" + statusText + ")");
      }

      // Add guest count if available
      var guestCountHtml = "";
      if (comment.guest_count !== null && comment.guest_count !== undefined && comment.guest_count > 0) {
        guestCountHtml = $("<span>").addClass("guest-count").text(" (+" + comment.guest_count + " guest" + (comment.guest_count > 1 ? "s" : "") + ")");
      }

      var timeSpan = $("<span>").addClass("time").text(formatTimeAgo(comment.created_at));
      commentDiv.append(nameSpan, statusHtml, guestCountHtml, textSpan, timeSpan);
      commentContainer.append(commentDiv);
    });

    var pagination = $("#rsvp-pagination");
    if (pagination.length === 0) {
      pagination = $('<div id="rsvp-pagination"></div>');
      commentContainer.after(pagination);
    }

    pagination.empty();

    if (totalPages > 1) {
      var prevLabel = language === "en" ? "&#8592; Prev" : "&#8592; Sebelumnya";
      var nextLabel = language === "en" ? "Next &#8594;" : "Berikutnya &#8594;";
      var prevBtn = $('<button class="rsvp-page-btn rsvp-prev-btn">').html(prevLabel);
      var nextBtn = $('<button class="rsvp-page-btn rsvp-next-btn">').html(nextLabel);
      var pageInfo = $('<span class="rsvp-page-info">').text(currentPage + " / " + totalPages);

      prevBtn.prop("disabled", currentPage === 1);
      nextBtn.prop("disabled", currentPage === totalPages);

      prevBtn.on("click", function () {
        if (currentPage > 1) {
          currentPage--;
          renderCommentsPage();
        }
      });

      nextBtn.on("click", function () {
        if (currentPage < totalPages) {
          currentPage++;
          renderCommentsPage();
        }
      });

      pagination.append(prevBtn, pageInfo, nextBtn).show();
    } else {
      pagination.hide();
    }
  }

  function formatTimeAgo(datetimeString) {
    var now = new Date();
    var targetDate = new Date(datetimeString);
    var timeDifference = now - targetDate;

    var seconds = Math.floor(timeDifference / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);

    var secondsAgo = language === "en" ? "seconds ago" : "detik lalu";
    var hoursAgo = language === "en" ? "hours ago" : "jam lalu";
    var minutesText = language === "en" ? "minutes" : "menit";
    var daysText = language === "en" ? "days" : "hari";

    if (seconds < 60) return seconds + " " + secondsAgo;
    if (minutes < 60) return minutes + " " + minutesText + " " + (seconds % 60) + " " + secondsAgo;
    return days + " " + daysText + " " + (hours % 24) + " " + hoursAgo;
  }

  function constructForm() {
    if (guestName && guestName.trim() !== "") {
      var guestNameInput = $("#form-field-guestname");
      guestNameInput.val(guestName);
      if (!isGuestNameEditable) guestNameInput.attr("disabled", true);
    }

    var guestCountInput = $("#form-field-guestcount");
    guestCountInput.attr("max", maxGuest);
    $('label[for="form-field-guestcount"]').append(" (MAX " + maxGuest + ")");
  }
});

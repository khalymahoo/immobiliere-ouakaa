/* Immobilière Ouakaa — interactions légères (aucune dépendance, aucun traceur) */
(function () {
  "use strict";

  /* Menu mobile */
  var burger = document.querySelector(".burger");
  var nav = document.querySelector(".nav-principale");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var ouvert = nav.classList.toggle("ouverte");
      burger.setAttribute("aria-expanded", ouvert ? "true" : "false");
    });
  }

  /* Filtres de la liste des appartements */
  var grille = document.querySelector("[data-grille-appartements]");
  if (grille) {
    var chips = document.querySelectorAll(".filtre-chip[data-type]");
    var caseDispo = document.querySelector("#filtre-disponibles");
    var compteur = document.querySelector("[data-compteur]");
    var typeActif = "tous";

    function appliquer() {
      var visibles = 0;
      grille.querySelectorAll(".carte-appart").forEach(function (carte) {
        var okType = typeActif === "tous" || carte.dataset.type === typeActif;
        var okDispo = !caseDispo || !caseDispo.checked || carte.dataset.statut === "disponible";
        var visible = okType && okDispo;
        carte.style.display = visible ? "" : "none";
        if (visible) visibles++;
      });
      if (compteur) compteur.textContent = visibles + (visibles > 1 ? " appartements affichés" : " appartement affiché");
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        typeActif = chip.dataset.type;
        chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
        appliquer();
      });
    });
    if (caseDispo) caseDispo.addEventListener("change", appliquer);
    appliquer();
  }

  /* Vidéo YouTube et carte Google Maps : chargées uniquement au clic (aucune requête tierce avant) */
  document.querySelectorAll(".media-clic[data-embed]").forEach(function (bouton) {
    bouton.addEventListener("click", function () {
      var cadre = document.createElement("div");
      cadre.className = "media-cadre";
      var iframe = document.createElement("iframe");
      iframe.src = bouton.dataset.embed;
      iframe.title = bouton.dataset.titre || "Contenu intégré";
      iframe.setAttribute("allow", "accelerometer; encrypted-media; picture-in-picture");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
      cadre.appendChild(iframe);
      bouton.replaceWith(cadre);
    });
  });

  /* Formulaire de contact (Web3Forms) */
  var form = document.querySelector("#formulaire-contact");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var etat = form.querySelector("[data-etat]");
      var bouton = form.querySelector("button[type=submit]");
      if (form.querySelector("[name=site_web]").value !== "") return; /* pot de miel anti-spam */
      bouton.disabled = true;
      etat.textContent = "Envoi en cours…";
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: form.dataset.cle,
          subject: "Nouveau message depuis le site Immobilière Ouakaa",
          name: form.querySelector("[name=nom]").value,
          phone: form.querySelector("[name=telephone]").value,
          message: form.querySelector("[name=message]").value
        })
      })
        .then(function (r) { return r.json(); })
        .then(function (r) {
          if (r.success) {
            etat.textContent = "Merci ! Votre message a bien été envoyé — nous vous répondrons rapidement.";
            form.reset();
          } else {
            etat.textContent = "L'envoi n'a pas abouti. Vous pouvez nous joindre directement par WhatsApp ou par téléphone.";
          }
        })
        .catch(function () {
          etat.textContent = "L'envoi n'a pas abouti. Vous pouvez nous joindre directement par WhatsApp ou par téléphone.";
        })
        .finally(function () { bouton.disabled = false; });
    });
  }
})();

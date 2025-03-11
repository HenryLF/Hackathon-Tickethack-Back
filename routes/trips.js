const express = require("express");
const router = express.Router();
const data = require("../tripsData"); // Import des trajets

let cart = [];
let bookings = [];



// Route pour ajouter un trajet
router.post("/", (req, res) => {
    const { departure, arrival, date } = req.body;
    if (!departure || !arrival || !date) {
        return res.status(400).json({ message: "Tous les champs sont requis (départ, arrivée, date)" });
    }
    // Vérifier si un trajet existe déjà avec le même départ, arrivée et date
    const existingTrips = data.filter(trip =>
        trip.departure.toLowerCase() === departure.toLowerCase() &&
        trip.arrival.toLowerCase() === arrival.toLowerCase() &&
        trip.date === date
    );
    // Si un trajet avec la même date existe, renvoyer une erreur
    if (existingTrips.length > 0) {
        return res.status(409).json({ message: "Un trajet avec la même date existe déjà" });
    }
    // Ajouter le nouveau trajet uniquement si aucun ne correspond à la même date
    const newTrajet = { id: Date.now(), departure, arrival, date };
    data.push(newTrajet); // Simule l'ajout dans une base de données (tableau en mémoire)
    res.status(201).json({ message: "Trajet ajouté avec succès", trajet: newTrajet });
});



// Route pour ajouter un trajet au panier
router.post("/cart", (req, res) => {
    const { tripId } = req.body;
    // Vérifier si un tripId a été fourni
    if (!tripId) {
        return res.status(400).json({ message: "L'ID du trajet est requis" });
    }
    // Vérifier si le trajet existe dans la BDD
    const trip = data.find(t => t.id === tripId);
    if (!trip) {
        return res.status(404).json({ message: "Trajet non trouvé" });
    }
    // Ajoute le trajet au panier
    cart.push(trip);
    res.status(200).json({ message: "Trajet ajouté au panier", cart });
});
// Route pour voir le panier
router.get("/cart", (req, res) => {
    res.status(200).json({ message: "Panier", cart });
});



// Route pour supprimer un trajet du panier
router.delete("/cart", (req, res) => {
    const { tripId } = req.body;
    // Vérifier si un tripId est fourni
    if (!tripId) {
        return res.status(400).json({ message: "L'ID du trajet est requis" });
    }
    // Trouver l'index du trajet dans le panier
    const tripIndex = cart.findIndex(t => t.id === tripId);
    // Si le trajet n'est pas trouvé dans le panier
    if (tripIndex === -1) {
        return res.status(404).json({ message: "Trajet non trouvé dans le panier" });
    }
    // Retirer le trajet du panier
    cart.splice(tripIndex, 1);
    res.status(200).json({ message: "Trajet supprimé du panier", cart });
});




// Route pour effectuer un achat et vider le panier
router.post("/purchase", (req, res) => {
    console.log("Panier avant l'achat:", cart);

    if (cart.length === 0) {
        return res.status(400).json({ message: "Le panier est vide. Ajoutez des trajets avant de passer à l'achat." });
    }

    // Cloner les trajets du panier dans les réservations
    const bookingsForThisPurchase = [...cart];

    // Ajouter ces trajets dans les réservations
    bookings.push(...bookingsForThisPurchase);

    // Vider le panier après l'achat
    cart = [];

    res.status(200).json({
        message: "Achat effectué avec succès. Les trajets ont été réservés.",
        bookings: bookingsForThisPurchase
    });
});




// Route pour voir les réservations et affiche tous les trajets payés ainsi que 
// le temps d’attente entre l’heure actuelle et celle du départ du trajet.
router.get("/bookings", (req, res) => {
    const now = new Date();

    const bookingsWithWaitTime = bookings.map(trip => {
        const departureTime = new Date(trip.date.$date || trip.date); // Gérer le format MongoDB et normal
        const timeDiff = departureTime - now; // Différence en millisecondes

        let waitTime;
        if (timeDiff > 0) {
            const hours = Math.floor(timeDiff / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            waitTime = `${hours}h ${minutes}min`;
        } else {
            waitTime = "Départ passé";
        }

        return { ...trip, waitTime };
    });

    res.status(200).json({ message: "Réservations", bookings: bookingsWithWaitTime });
});

module.exports = router;



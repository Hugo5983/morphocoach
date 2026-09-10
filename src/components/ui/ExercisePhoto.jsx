import { useState, useEffect } from "react";
import { useExercisePhoto } from "../../hooks/useExercisePhoto.js";
import { DARK } from "../../data/constants.js";

/**
 * Photo d'exercice.
 *
 * Deux usages :
 *   <ExercisePhoto nom="Développé couché barre" />                → fiche, 4:5, alternance auto
 *   <ExercisePhoto nom="Développé couché barre" variant="thumb"/> → vignette carrée figée
 *
 * Quand l'exercice a une position de départ ET une position d'arrivée,
 * la fiche alterne entre les deux toutes les 1,5 s : l'utilisateur voit
 * le mouvement au lieu d'une posture figée.
 */
export default function ExercisePhoto({
  nom,
  variant = "full",      // "full" | "thumb"
  radius,
  style,
}) {
  const photo = useExercisePhoto(nom);
  const [i, setI] = useState(0);
  const anime = variant === "full" && photo.toutes.length > 1;

  useEffect(() => {
    if (!anime) return;
    const t = setInterval(() => setI((v) => (v + 1) % photo.toutes.length), 1500);
    return () => clearInterval(t);
  }, [anime, photo.toutes.length]);

  const thumb = variant === "thumb";
  const r = radius ?? (thumb ? 12 : 20);

  // ── Pas d'image pour cet exercice : placeholder discret ──
  if (!photo.existe) {
    return (
      <div style={{
        aspectRatio: thumb ? "1 / 1" : "4 / 5",
        width: "100%", borderRadius: r,
        background: DARK.surface,
        border: `1px solid ${DARK.border}`,
        display: "grid", placeItems: "center",
        ...style,
      }}>
        <svg width={thumb ? 20 : 30} height={thumb ? 20 : 30} viewBox="0 0 24 24"
          fill="none" stroke={DARK.dim} strokeWidth="1.6" strokeLinecap="round">
          <path d="M4 9v6M7 7v10M17 7v10M20 9v6M7 12h10" />
        </svg>
      </div>
    );
  }

  const src = anime ? photo.toutes[i] : photo.toutes[0];

  return (
    <div style={{
      position: "relative", overflow: "hidden",
      width: "100%", aspectRatio: thumb ? "1 / 1" : "4 / 5",
      borderRadius: r, background: DARK.surface,
      border: `1px solid ${DARK.border}`,
      ...style,
    }}>
      {/* Les deux images sont montées en permanence et on joue sur l'opacité :
          ça évite le clignotement d'un rechargement à chaque bascule. */}
      {photo.toutes.map((u, k) => (
        <img
          key={u}
          src={u}
          alt={nom}
          loading="lazy"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            objectPosition: "center 40%",
            opacity: anime ? (k === i ? 1 : 0) : (k === 0 ? 1 : 0),
            transition: "opacity .45s ease",
          }}
        />
      ))}

      {/* Repère départ / fin, uniquement sur la fiche */}
      {anime && (
        <div style={{
          position: "absolute", bottom: 10, left: 10,
          display: "flex", alignItems: "center", gap: 6,
          background: "rgba(9,11,16,0.72)",
          border: `1px solid ${DARK.borderHi}`,
          borderRadius: 99, padding: "5px 10px",
          backdropFilter: "blur(8px)",
          fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em",
          color: DARK.text, textTransform: "uppercase",
        }}>
          <span style={{
            width: 5, height: 5, borderRadius: "50%",
            background: "#3C5BFF",
            boxShadow: "0 0 6px rgba(60,91,255,0.8)",
          }} />
          {i === 0 ? "Départ" : "Fin"}
        </div>
      )}
    </div>
  );
}

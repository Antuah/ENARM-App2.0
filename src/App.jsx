import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ArrowUp,
  Baby,
  Bell,
  BookOpen,
  Bookmark,
  BrainCircuit,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Crown,
  Eye,
  EyeOff,
  Flame,
  GraduationCap,
  Heart,
  HeartPulse,
  History,
  Home,
  Layers,
  Lightbulb,
  LockKeyhole,
  LogOut,
  Mail,
  Map,
  Menu,
  RotateCcw,
  Scissors,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Stethoscope,
  Target,
  Trophy,
  UserRound,
  X,
  Zap,
  ChartNoAxesCombined,
  LayoutGrid,
  CheckCircle2,
  CircleX,
  Volume2,
} from "lucide-react";
import { activities, areas, missions, questions, sampleHistory } from "./data";

const icons = {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ArrowUp,
  Baby,
  Bell,
  BookOpen,
  Bookmark,
  BrainCircuit,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Crown,
  Eye,
  EyeOff,
  Flame,
  GraduationCap,
  Heart,
  HeartPulse,
  History,
  Home,
  Layers,
  Lightbulb,
  LockKeyhole,
  LogOut,
  Mail,
  Map,
  Menu,
  RotateCcw,
  Scissors,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Stethoscope,
  Target,
  Trophy,
  UserRound,
  X,
  Zap,
  ChartNoAxesCombined,
  LayoutGrid,
  CheckCircle2,
  CircleX,
  Volume2,
};
function Icon({ name, size = 20, ...props }) {
  const Component = icons[name] || Sparkles;
  return (
    <Component size={size} strokeWidth={1.7} aria-hidden="true" {...props} />
  );
}
const asset = (name) => `${import.meta.env.BASE_URL}assets/${name}.png`;
function Mascot({ name = "doctor", className = "", ...props }) {
  return (
    <img
      className={`mascot ${className}`}
      src={asset(name)}
      alt={
        name === "celebrate"
          ? "Un choque de manos para celebrar tu avance"
          : "Mascota de Entrenarme con uniforme médico"
      }
      {...props}
    />
  );
}
function Logo({ onClick, small = false }) {
  return (
    <button
      className={`logo ${small ? "small" : ""}`}
      onClick={onClick}
      aria-label="Entrenarme, ir al inicio"
    >
      <span>
        entr<strong>enarm</strong>e
      </span>
      <span className="logo-bulb">
        <Lightbulb strokeWidth={1.15} />
        <i />
      </span>
    </button>
  );
}
function Button({
  children,
  icon,
  secondary,
  ghost,
  className = "",
  ...props
}) {
  return (
    <button
      className={`${ghost ? "btn-ghost" : secondary ? "btn-secondary" : "btn-primary"} ${className}`}
      {...props}
    >
      {children}
      {icon && <Icon name={icon} size={18} />}
    </button>
  );
}
function Tag({ children, color = "purple" }) {
  return <span className={`tag ${color}`}>{children}</span>;
}
function Progress({ value, color = "lime" }) {
  return (
    <div
      className={`progress ${color}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label="Progreso"
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}
function PageTitle({ eyebrow, title, subtitle, action }) {
  return (
    <div className="page-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
function Modal({ title, children, close }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    el.showModal();
    return () => el.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
      aria-labelledby="modal-title"
    >
      <div className="modal-head">
        <h2 id="modal-title">{title}</h2>
        <button className="icon-button" onClick={close} aria-label="Cerrar">
          <X />
        </button>
      </div>
      {children}
    </dialog>
  );
}
function Field({ label, icon, error, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-wrap">
        {icon && <Icon name={icon} size={18} />}
        <input {...props} />
      </div>
      {error && <small className="error">{error}</small>}
    </label>
  );
}
function Password({ label = "Contraseña", ...props }) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="field">
      <span>{label}</span>
      <div className="input-wrap">
        <LockKeyhole size={18} />
        <input type={visible ? "text" : "password"} {...props} />
        <button
          type="button"
          className="input-eye"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}
const safeRead = () => {
  try {
    return JSON.parse(localStorage.getItem("entrenarme-demo-v1")) || {};
  } catch {
    return {};
  }
};
const navItems = [
  { path: "/inicio", icon: "Home", name: "Inicio" },
  { path: "/quizzes", icon: "Zap", name: "Quizzes" },
  { path: "/enarmapa", icon: "Map", name: "ENARMapa" },
  { path: "/estadisticas", icon: "ChartNoAxesCombined", name: "Estadísticas" },
  { path: "/perfil", icon: "UserRound", name: "Perfil" },
];

export default function App() {
  const [route, setRoute] = useState(
    () => window.location.hash.slice(1) || "/bienvenida",
  );
  const [saved, setSaved] = useState(safeRead);
  const profile = {
    name: "Alex",
    lastname: "",
    email: "alex@ejemplo.com",
    specialty: "Medicina Interna",
    target: "2027",
    plan: "Básico",
    ...saved.profile,
  };
  const marked = Array.isArray(saved.marked) ? saved.marked : [1, 3];
  const history = Array.isArray(saved.history) ? saved.history : [];
  const completed = Array.isArray(saved.completed) ? saved.completed : [0, 1];
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);
  const [session, setSession] = useState(null);
  const toastTimer = useRef(null);
  useEffect(() => {
    const change = () => {
      setRoute(window.location.hash.slice(1) || "/bienvenida");
      setModal(null);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem("entrenarme-demo-v1", JSON.stringify(saved));
    } catch {
      /* Browsing remains available without storage. */
    }
  }, [saved]);
  useEffect(() => {
    document.title = `Entrenarme · ${route === "/bienvenida" ? "Entrena tu mente" : navItems.find((n) => route.startsWith(n.path))?.name || "Tu entrenamiento"}`;
    document.querySelector("main")?.focus({ preventScroll: true });
  }, [route]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const notify = (text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 4200);
  };
  const go = (path) => {
    if (route === path) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = path;
  };
  const navigate = (path) => {
    if (route === "/actividad" && session)
      setModal({ type: "exit", next: path });
    else go(path);
  };
  const updateProfile = (data) =>
    setSaved((old) => ({ ...old, profile: { ...profile, ...data } }));
  const toggleMark = (id) => {
    setSaved((old) => ({
      ...old,
      marked: (old.marked || [1, 3]).includes(id)
        ? (old.marked || [1, 3]).filter((x) => x !== id)
        : [...(old.marked || [1, 3]), id],
    }));
  };
  const startSession = (mode, selected = [], mission = null, topics = []) => {
    const pool =
      mode === "flashcards"
        ? questions.filter((q) => marked.includes(q.id))
        : questions.filter(
            (q) =>
              (!selected.length || selected.includes(q.area)) &&
              (!topics.length || topics.includes(q.topic)),
          );
    if (!pool.length) {
      notify(
        mode === "flashcards"
          ? "Marca una pregunta para crear tu primera flashcard."
          : "Elige otro tema para encontrar preguntas de ejemplo.",
      );
      return;
    }
    setSession({
      mode,
      questions: pool,
      answers: {},
      current: 0,
      mission,
      ratings: [],
      started: Date.now(),
    });
    go("/actividad");
  };
  const finishSession = () => {
    if (!session) return;
    const isCards = ["flashcards", "inteligente"].includes(session.mode);
    const correct = isCards
      ? session.ratings.filter((r) => r === "Fácil").length
      : session.questions.filter((q) => session.answers[q.id] === q.answer)
          .length;
    const result = {
      ...session,
      id: String(Date.now()),
      title:
        session.mission !== null
          ? missions[session.mission]
          : activities.find((a) => a.id === session.mode)?.title ||
            "Entrenamiento",
      date: "Ahora",
      total: session.questions.length,
      correct,
      score: Math.round((correct / session.questions.length) * 100),
      isCards,
    };
    setSaved((old) => ({
      ...old,
      history: [result, ...(old.history || [])].slice(0, 30),
      completed:
        session.mission !== null
          ? [...new Set([...(old.completed || [0, 1]), session.mission])]
          : old.completed || [0, 1],
    }));
    setSession(null);
    go(`/resultados/${result.id}`);
  };
  const isPublic = [
    "/bienvenida",
    "/login",
    "/registro",
    "/recuperar",
  ].includes(route);
  const activeNav =
    route.startsWith("/quizzes") ||
    ["/actividad", "/marcadas"].includes(route) ||
    route.startsWith("/resultados")
      ? "/quizzes"
      : route.startsWith("/perfil") ||
          ["/planes", "/configuracion", "/ayuda"].includes(route)
        ? "/perfil"
        : route;
  const result =
    history.find((h) => h.id === route.split("/")[2]) || history[0];

  let content;
  if (route === "/bienvenida") content = <Landing go={go} />;
  else if (
    route === "/login" ||
    route === "/registro" ||
    route === "/recuperar"
  )
    content = (
      <Auth
        key={route}
        route={route}
        go={go}
        updateProfile={updateProfile}
        notify={notify}
      />
    );
  else if (route === "/inicio")
    content = (
      <Dashboard
        profile={profile}
        history={history}
        completed={completed}
        go={go}
        openModal={setModal}
      />
    );
  else if (route === "/quizzes") content = <QuizHub go={go} />;
  else if (route === "/quizzes/historial")
    content = <HistoryPage history={history} go={go} openModal={setModal} />;
  else if (route.startsWith("/quizzes/"))
    content = (
      <QuizSetup
        key={route}
        mode={route.split("/")[2]}
        marked={marked}
        start={startSession}
        go={go}
      />
    );
  else if (route === "/actividad")
    content = session ? (
      <QuizRunner
        session={session}
        setSession={setSession}
        marked={marked}
        toggleMark={toggleMark}
        finish={finishSession}
        openModal={setModal}
      />
    ) : (
      <EmptyState
        title="Tu siguiente reto te espera"
        text="Elige una actividad para comenzar a entrenar."
        action="Explorar quizzes"
        onClick={() => go("/quizzes")}
      />
    );
  else if (route.startsWith("/resultados/"))
    content = result ? (
      <Results
        result={result}
        go={go}
        marked={marked}
        toggleMark={toggleMark}
      />
    ) : (
      <EmptyState
        title="Cada historia tiene un comienzo"
        text="Completa un quiz para ver aquí tu resultado."
        action="Hacer mi primer quiz"
        onClick={() => go("/quizzes")}
      />
    );
  else if (route === "/enarmapa")
    content = <Roadmap completed={completed} openModal={setModal} />;
  else if (route === "/estadisticas")
    content = <Stats history={history} openModal={setModal} />;
  else if (route === "/perfil")
    content = (
      <Profile profile={profile} marked={marked} go={go} openModal={setModal} />
    );
  else if (route === "/planes")
    content = (
      <Plans
        profile={profile}
        select={(plan) => {
          updateProfile({ plan });
          notify(
            `Plan ${plan} activado en la demo. No se realizó ningún cobro.`,
          );
          go("/perfil");
        }}
      />
    );
  else if (route === "/configuracion")
    content = (
      <SettingsPage
        profile={profile}
        saved={saved}
        setSaved={setSaved}
        updateProfile={updateProfile}
        notify={notify}
        go={go}
        reset={() => setModal({ type: "reset", title: "¿Empezamos de nuevo?" })}
      />
    );
  else if (route === "/ayuda") content = <Help go={go} />;
  else if (route === "/marcadas")
    content = <Marked marked={marked} toggleMark={toggleMark} go={go} />;
  else
    content = (
      <EmptyState
        title="Tomemos otra ruta"
        text="Esta pantalla no forma parte del recorrido."
        action="Volver al inicio"
        onClick={() => go("/inicio")}
      />
    );

  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Saltar al contenido
      </a>
      {isPublic ? (
        content
      ) : (
        <div className="app-shell">
          <aside className="sidebar">
            <Logo onClick={() => navigate("/inicio")} />
            <span className="sidebar-caption">TU ESPACIO DE ENTRENAMIENTO</span>
            <nav aria-label="Navegación principal">
              {navItems.map((n) => (
                <button
                  key={n.path}
                  className={`nav-item ${activeNav === n.path ? "active" : ""}`}
                  onClick={() => navigate(n.path)}
                  aria-current={activeNav === n.path ? "page" : undefined}
                >
                  <Icon name={n.icon} />
                  <span>{n.name}</span>
                  {activeNav === n.path && <span className="nav-dot" />}
                </button>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <div className="sidebar-promo">
                <Crown size={22} />
                <strong>Tu potencial, sin límites.</strong>
                <p>Dale un impulso a tu preparación.</p>
                <button onClick={() => go("/planes")}>
                  Conoce Premium <ArrowUpRight size={16} />
                </button>
              </div>
              <button className="sidebar-help" onClick={() => go("/ayuda")}>
                <CircleHelp size={18} /> ¿Necesitas una mano?
              </button>
              <button className="sidebar-profile" onClick={() => go("/perfil")}>
                <span className="avatar">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
                <span>
                  <strong>{profile.name}</strong>
                  <small>Futuro residente</small>
                </span>
                <ChevronRight size={17} />
              </button>
            </div>
          </aside>
          <div className="app-body">
            <header className="topbar">
              <div className="mobile-brand">
                <Logo small onClick={() => navigate("/inicio")} />
              </div>
              <span className="desktop-date">
                <span className="status-dot" /> UN POCO MEJOR CADA DÍA
              </span>
              <div className="topbar-actions">
                <button
                  className="token-pill"
                  onClick={() => setModal({ type: "tokens" })}
                >
                  <Zap size={16} fill="currentColor" /> 10 <span>tokens</span>
                  <ChevronDown size={13} />
                </button>
                <button
                  className="notification-button icon-button"
                  onClick={() => setModal({ type: "notifications" })}
                  aria-label="Ver notificaciones"
                >
                  <Bell size={20} />
                  <i />
                </button>
                <button
                  className="avatar small-avatar"
                  onClick={() => navigate("/perfil")}
                  aria-label="Mi perfil"
                >
                  {profile.name.charAt(0).toUpperCase()}
                </button>
              </div>
            </header>
            <main
              id="main-content"
              tabIndex={-1}
              className={`main-content ${route === "/actividad" ? "runner-main" : ""}`}
            >
              {content}
              <footer className="app-footer">
                <span>Hecho para tu próxima gran meta.</span>
                <span>
                  <i /> Demo interactiva · datos de ejemplo
                </span>
              </footer>
            </main>
          </div>
          <nav className="bottom-nav" aria-label="Navegación móvil">
            {navItems.map((n) => (
              <button
                key={n.path}
                className={activeNav === n.path ? "active" : ""}
                onClick={() => navigate(n.path)}
                aria-current={activeNav === n.path ? "page" : undefined}
              >
                <Icon name={n.icon} size={22} />
                <span>{n.name}</span>
              </button>
            ))}
          </nav>
        </div>
      )}
      <div
        className={`toast ${toast ? "show" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast && (
          <>
            <CheckCircle2 size={19} />
            {toast}
          </>
        )}
      </div>
      {modal && (
        <Modal
          title={
            modal.title ||
            {
              tokens: "Un impulso para entrenar",
              notifications: "Tu centro de novedades",
              mission: "Tu misión del día",
              locked: "Cada paso abre un nuevo camino",
              exit: "¿Salir del entrenamiento?",
              finish: "¿Terminamos por hoy?",
              questionMap: "Mapa de preguntas",
              logout: "¿Cerrar tu sesión de demo?",
              sample: "Una mirada a tu entrenamiento",
              score: "Tu promedio, paso a paso",
              achievement: "¡Vas construyendo tu camino!",
            }[modal.type] ||
            "Un poco más de detalle"
          }
          close={() => setModal(null)}
        >
          {modal.type === "tokens" && (
            <>
              <div className="token-large">
                <Zap />
                10 <small>tokens diarios</small>
              </div>
              <p>
                Úsalos para hacer quizzes y repasar. Los Tokens+ reconocen tu
                constancia y los comodines te ayudan a cuidar tu racha.
              </p>
              <div className="modal-metrics">
                <div>
                  <strong>2</strong>
                  <span>Comodines</span>
                </div>
                <div>
                  <strong>5</strong>
                  <span>Tokens+</span>
                </div>
              </div>
              <p className="muted small-text">
                En este mockup, los tokens son ilustrativos y no se descuentan.
              </p>
              <Button
                onClick={() => {
                  setModal(null);
                  go("/quizzes");
                }}
                icon="ArrowRight"
              >
                Vamos a entrenar
              </Button>
            </>
          )}
          {modal.type === "notifications" && (
            <div className="notice-list">
              <div>
                <span className="icon-tile lime">
                  <Flame />
                </span>
                <div>
                  <strong>Tu racha te está esperando</strong>
                  <p>
                    Un pequeño entrenamiento puede hacer una gran diferencia.
                  </p>
                  <small>Hoy · Ejemplo</small>
                </div>
              </div>
              <div>
                <span className="icon-tile cyan">
                  <Map />
                </span>
                <div>
                  <strong>Tu ruta está lista</strong>
                  <p>Continúa con tu misión en ENARMapa.</p>
                  <button
                    className="text-link"
                    onClick={() => {
                      setModal(null);
                      go("/enarmapa");
                    }}
                  >
                    Ver mi ruta <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
          {modal.type === "mission" && (
            <>
              <Tag color="cyan">SEMANA 01 · DÍA {modal.day + 1}</Tag>
              <h3 className="modal-big-title">{missions[modal.day]}</h3>
              <p>
                {modal.day === 6
                  ? "Repasa lo aprendido y celebra tu avance de esta semana."
                  : "Pon a prueba lo que sabes y descubre tu siguiente oportunidad de mejorar."}
              </p>
              <div className="session-facts">
                <span>
                  <BookOpen size={17} /> 5 preguntas de muestra
                </span>
                <span>
                  <Clock3 size={17} /> ~3 minutos
                </span>
              </div>
              <Button
                className="full"
                icon="ArrowRight"
                onClick={() => {
                  const day = modal.day;
                  setModal(null);
                  startSession(day === 6 ? "inteligente" : "rapido", [], day);
                }}
              >
                Comenzar misión
              </Button>
            </>
          )}
          {modal.type === "locked" && (
            <>
              <div className="empty-icon">
                <LockKeyhole />
              </div>
              <p>
                Completa las misiones anteriores para desbloquear{" "}
                <strong>{missions[modal.day]}</strong>. Cada día de práctica te
                acerca a tu meta.
              </p>
              <Button className="full" onClick={() => setModal(null)}>
                Entendido
              </Button>
            </>
          )}
          {modal.type === "exit" && (
            <>
              <p>
                Se perderán las respuestas de esta sesión. Puedes quedarte y
                terminar tu entrenamiento.
              </p>
              <div className="modal-actions">
                <Button
                  secondary
                  onClick={() => {
                    const next = modal.next || "/quizzes";
                    setSession(null);
                    setModal(null);
                    go(next);
                  }}
                >
                  Salir de la actividad
                </Button>
                <Button onClick={() => setModal(null)}>
                  Seguir entrenando
                </Button>
              </div>
            </>
          )}
          {modal.type === "finish" && (
            <>
              <p>
                Has respondido{" "}
                <strong>
                  {Object.keys(session?.answers || {}).length} de{" "}
                  {session?.questions.length}
                </strong>{" "}
                preguntas. Las que queden sin responder no sumarán aciertos.
              </p>
              <div className="modal-actions">
                <Button secondary onClick={() => setModal(null)}>
                  Continuar
                </Button>
                <Button
                  onClick={() => {
                    setModal(null);
                    finishSession();
                  }}
                >
                  Ver resultados
                </Button>
              </div>
            </>
          )}
          {modal.type === "questionMap" && (
            <>
              <p>Salta a una pregunta para continuar o revisar tu respuesta.</p>
              <div className="question-map">
                {session?.questions.map((q, i) => (
                  <button
                    key={q.id}
                    className={`${session.current === i ? "current" : ""} ${session.answers[q.id] !== undefined ? "answered" : ""}`}
                    onClick={() => {
                      setSession((s) => ({ ...s, current: i }));
                      setModal(null);
                    }}
                  >
                    {i + 1}
                    {marked.includes(q.id) && <Bookmark size={11} />}
                  </button>
                ))}
              </div>
              <p className="small-text muted">
                Morado: pregunta actual · Lima: respondida
              </p>
            </>
          )}
          {modal.type === "reset" && (
            <>
              <p>
                Se restablecerán el perfil, las preferencias y los resultados de
                prueba de este navegador a los datos de ejemplo iniciales.
              </p>
              <div className="modal-actions">
                <Button secondary onClick={() => setModal(null)}>
                  Conservar mi avance
                </Button>
                <Button
                  onClick={() => {
                    setSaved({});
                    setSession(null);
                    setModal(null);
                    go("/bienvenida");
                    notify("La demo está lista para empezar de nuevo.");
                  }}
                >
                  Reiniciar demo
                </Button>
              </div>
            </>
          )}
          {modal.type === "logout" && (
            <>
              <p>
                Tu progreso de ejemplo seguirá disponible en este navegador.
              </p>
              <div className="modal-actions">
                <Button secondary onClick={() => setModal(null)}>
                  Volver
                </Button>
                <Button
                  onClick={() => {
                    setModal(null);
                    go("/login");
                  }}
                >
                  Cerrar sesión
                </Button>
              </div>
            </>
          )}
          {modal.type === "sample" && (
            <>
              <Tag color="cyan">SESIÓN DE EJEMPLO</Tag>
              <h3 className="modal-big-title">{modal.item.title}</h3>
              <div className="modal-metrics">
                <div>
                  <strong>{modal.item.score}%</strong>
                  <span>Resultado</span>
                </div>
                <div>
                  <strong>
                    {modal.item.correct}/{modal.item.total}
                  </strong>
                  <span>Aciertos</span>
                </div>
              </div>
              <p>
                Esta sesión ilustra cómo se verá tu historial. Completa un quiz
                de la demo para revisar tus propias respuestas.
              </p>
              <Button
                icon="ArrowRight"
                onClick={() => {
                  setModal(null);
                  go("/quizzes/rapido");
                }}
              >
                Hacer un quiz
              </Button>
            </>
          )}
          {modal.type === "score" && (
            <>
              <p>
                En la aplicación final, el promedio actual considera las últimas
                280 preguntas calificadas y revisadas.
              </p>
              <p>
                La demo comienza con datos ilustrativos. Después de completar un
                quiz, verás el resultado de tu última sesión de muestra.
              </p>
              <Button onClick={() => setModal(null)}>¡Vamos por más!</Button>
            </>
          )}
          {modal.type === "achievement" && (
            <>
              <div className="empty-icon">
                <Trophy />
              </div>
              <p>
                Completa los siete días del ENARMapa para conseguir tu insignia{" "}
                <strong>Primer mapa clínico</strong>.
              </p>
              <Progress value={(completed.length / 7) * 100} />
              <p className="small-text muted">
                {completed.length} de 7 misiones completadas
              </p>
              <Button
                onClick={() => {
                  setModal(null);
                  go("/enarmapa");
                }}
              >
                Ver mi ENARMapa
              </Button>
            </>
          )}
          {modal.type === "area" && (
            <>
              <Tag color={modal.area.color}>{modal.area.name}</Tag>
              <h3 className="modal-big-title">
                Siempre hay espacio para crecer.
              </h3>
              <p>
                Tu desempeño de ejemplo en esta área es del {modal.area.score}%.
                Entrena por tema para afianzar tus conocimientos.
              </p>
              <Button
                icon="ArrowRight"
                onClick={() => {
                  setModal(null);
                  go("/quizzes/personalizado");
                }}
              >
                Personalizar un quiz
              </Button>
            </>
          )}
        </Modal>
      )}
    </>
  );
}

function Landing({ go }) {
  return (
    <div className="landing">
      <header className="landing-header">
        <Logo onClick={() => go("/bienvenida")} />
        <nav aria-label="Acceso">
          <button className="landing-login" onClick={() => go("/login")}>
            Iniciar sesión
          </button>
          <Button secondary icon="ArrowUpRight" onClick={() => go("/registro")}>
            Crear cuenta
          </Button>
        </nav>
      </header>
      <main id="main-content" tabIndex={-1}>
        <section className="landing-hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="status-dot" /> TU FUTURO MÉDICO EMPIEZA HOY
            </div>
            <h1>
              ENTRENA
              <br />
              <span>TU MENTE.</span>
              <br />
              CONQUISTA
              <br className="desktop-only" /> <em>EL ENARM.</em>
            </h1>
            <p>
              Tu próxima especialidad comienza con un pequeño reto. Practica,
              aprende y avanza hacia el lugar donde quieres estar.
            </p>
            <div className="hero-buttons">
              <Button icon="ArrowRight" onClick={() => go("/registro")}>
                Comenzar mi entrenamiento
              </Button>
              <button className="explore-demo" onClick={() => go("/inicio")}>
                Explorar la demo <ArrowUpRight size={17} />
              </button>
            </div>
            <div className="hero-note">
              <ShieldCheck size={15} />
              <span>A tu ritmo. Desde donde estés.</span>
              <span className="little-separator" />
              <span>Hecho para el ENARM</span>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="art-glow" />
            <div className="floating-stat stat-streak">
              <span>
                <Flame size={14} /> RACHA
              </span>
              <strong>
                12 <small>días</small>
              </strong>
              <div className="mini-streak">
                {Array.from({ length: 7 }, (_, i) => (
                  <i key={i} />
                ))}
              </div>
            </div>
            <div className="floating-stat stat-accuracy">
              <span>ACERTANDO EN GRANDE</span>
              <strong>
                85<span>%</span>
                <ArrowUpRight />
              </strong>
              <small>Un poco mejor cada día</small>
            </div>
            <Mascot name="hero" />
            <div className="mascot-platform" />
            <div className="floating-note">
              <span>
                <Sparkles size={17} />
              </span>
              Tu mejor versión está en camino.
            </div>
            <div className="art-star star-one">✦</div>
            <div className="art-star star-two">✦</div>
            <div className="art-cross">+</div>
          </div>
        </section>
        <section
          className="landing-bottom"
          aria-label="Así entrenas con nosotros"
        >
          <div className="landing-bottom-heading">
            <span>
              UNA META GRANDE.
              <br />
              <strong>UN PASO A LA VEZ.</strong>
            </span>
            <div className="line" />
          </div>
          <div className="landing-features">
            {[
              {
                icon: "Zap",
                number: "01",
                title: "Practica con intención",
                text: "Quizzes para retar lo que sabes.",
                color: "lime",
              },
              {
                icon: "Map",
                number: "02",
                title: "Encuentra tu camino",
                text: "Una ruta para seguir avanzando.",
                color: "cyan",
              },
              {
                icon: "ChartNoAxesCombined",
                number: "03",
                title: "Mira cuánto has crecido",
                text: "Tu esfuerzo se convierte en progreso.",
                color: "pink",
              },
            ].map((f) => (
              <button key={f.number} onClick={() => go("/inicio")}>
                <span className={`feature-symbol ${f.color}`}>
                  <Icon name={f.icon} size={25} />
                </span>
                <div>
                  <span className="feature-number">{f.number} /</span>
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
                <ArrowUpRight size={17} />
              </button>
            ))}
          </div>
        </section>
      </main>
      <footer className="landing-footer">
        <span>© 2026 Entrenarme</span>
        <span>
          <i /> Mockup interactivo
        </span>
        <button onClick={() => go("/ayuda")}>
          Sobre esta demo <ArrowUpRight size={13} />
        </button>
      </footer>
    </div>
  );
}

function Auth({ route, go, updateProfile, notify }) {
  const signup = route === "/registro";
  const recovery = route === "/recuperar";
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [plan, setPlan] = useState("Básico");
  const [form, setForm] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    specialty: "Medicina Interna",
    target: "2027",
  });
  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    if (recovery) {
      setSent(true);
      return;
    }
    if (signup && step < 2) {
      setStep((s) => s + 1);
      return;
    }
    updateProfile({
      name: signup ? form.name.trim() || "Alex" : "Alex",
      lastname: form.lastname.trim(),
      email: form.email,
      specialty: form.specialty,
      target: form.target,
      plan,
    });
    notify(
      signup
        ? "¡Tu perfil de demo está listo! Vamos paso a paso."
        : "¡Qué bueno tenerte de vuelta!",
    );
    go("/inicio");
  };
  return (
    <div className="auth-page">
      <header className="auth-header">
        <Logo onClick={() => go("/bienvenida")} />
        <button
          className="back-link"
          onClick={() => (step > 0 ? setStep((s) => s - 1) : go("/bienvenida"))}
        >
          <ArrowLeft size={17} /> Volver
        </button>
      </header>
      <main id="main-content" tabIndex={-1} className="auth-main">
        <section className="auth-card">
          <div className="eyebrow">
            {recovery
              ? "VOLVAMOS A CONECTAR"
              : signup
                ? "TU SIGUIENTE CAPÍTULO"
                : "BIENVENIDO DE VUELTA"}
          </div>
          <h1>
            {recovery ? (
              <>
                RECUPERA
                <br />
                <span>TU ACCESO.</span>
              </>
            ) : signup ? (
              step === 0 ? (
                <>
                  CREA TU
                  <br />
                  <span>CUENTA.</span>
                </>
              ) : step === 1 ? (
                <>
                  ELIGE
                  <br />
                  <span>TU PLAN.</span>
                </>
              ) : (
                <>
                  HABLEMOS
                  <br />
                  <span>DE TU META.</span>
                </>
              )
            ) : (
              <>
                SIGAMOS
                <br />
                <span>CRECIENDO.</span>
              </>
            )}
          </h1>
          <p className="auth-description">
            {recovery
              ? "Te ayudamos a retomar tu entrenamiento."
              : signup
                ? [
                    "El primer paso hacia tu próxima gran meta.",
                    "Elige cómo quieres empezar. Puedes cambiarlo después.",
                    "Personaliza tu camino hacia la residencia.",
                  ][step]
                : "Tu próxima gran conquista empieza con una sesión más."}
          </p>
          {sent ? (
            <div className="recovery-success">
              <div className="empty-icon">
                <Mail />
              </div>
              <h2>Así se vería la confirmación</h2>
              <p>
                En la aplicación final, recibirías un enlace en tu correo para
                recuperar el acceso. Esta demo no envía mensajes.
              </p>
              <Button className="full" onClick={() => go("/login")}>
                Volver a iniciar sesión
              </Button>
            </div>
          ) : (
            <form onSubmit={submit}>
              {(!signup || step === 0) && (
                <>
                  {signup && (
                    <div className="two-fields">
                      <Field
                        label="Nombre"
                        name="name"
                        autoComplete="given-name"
                        placeholder="Alex"
                        value={form.name}
                        onChange={change}
                        required
                        maxLength={35}
                      />
                      <Field
                        label="Apellidos"
                        name="lastname"
                        autoComplete="family-name"
                        placeholder="García"
                        value={form.lastname}
                        onChange={change}
                        required
                        maxLength={60}
                      />
                    </div>
                  )}
                  <Field
                    label="Correo electrónico"
                    icon="Mail"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    value={form.email}
                    onChange={change}
                    required
                  />
                  {!recovery && (
                    <Password
                      name="password"
                      label={signup ? "Crea una contraseña" : "Contraseña"}
                      autoComplete={
                        signup ? "new-password" : "current-password"
                      }
                      placeholder={
                        signup ? "Al menos 8 caracteres" : "Tu contraseña"
                      }
                      value={form.password}
                      onChange={change}
                      minLength={signup ? 8 : 1}
                      required
                    />
                  )}
                  {!signup && !recovery && (
                    <div className="form-extras">
                      <label className="checkbox-label">
                        <input type="checkbox" /> Recordarme
                      </label>
                      <button type="button" onClick={() => go("/recuperar")}>
                        Olvidé mi contraseña
                      </button>
                    </div>
                  )}
                </>
              )}
              {signup && step === 1 && (
                <div className="signup-plans">
                  {["Básico", "Premium"].map((p) => (
                    <button
                      key={p}
                      type="button"
                      className={`signup-plan ${plan === p ? "selected" : ""}`}
                      onClick={() => setPlan(p)}
                    >
                      <div>
                        <span
                          className={`radio-dot ${plan === p ? "checked" : ""}`}
                        />
                        <strong>{p}</strong>
                        {p === "Premium" && <Crown size={18} />}
                      </div>
                      <p>
                        {p === "Básico"
                          ? "Empieza con quizzes, flashcards y tu mapa de estudio."
                          : "Explora todas las herramientas de tu preparación."}
                      </p>
                      <span>
                        {p === "Básico"
                          ? "Gratis para comenzar"
                          : "Prueba visual · sin cobros"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {signup && step === 2 && (
                <>
                  <label className="field">
                    <span>Especialidad que te inspira</span>
                    <select
                      name="specialty"
                      value={form.specialty}
                      onChange={change}
                    >
                      {areas.map((a) => (
                        <option key={a.name}>{a.name}</option>
                      ))}
                      <option>Aún estoy explorando</option>
                    </select>
                  </label>
                  <label className="field">
                    <span>¿Cuándo presentarás el ENARM?</span>
                    <select name="target" value={form.target} onChange={change}>
                      <option>2026</option>
                      <option>2027</option>
                      <option>2028</option>
                    </select>
                  </label>
                  <div className="callout">
                    <Sparkles size={20} />
                    <p>
                      No necesitas tenerlo todo resuelto. Lo importante es
                      empezar.
                    </p>
                  </div>
                </>
              )}
              {signup && (
                <div
                  className="step-indicator"
                  aria-label={`Paso ${step + 1} de 3`}
                >
                  {[0, 1, 2].map((i) => (
                    <span className={i <= step ? "active" : ""} key={i} />
                  ))}
                  <small>Paso {step + 1} de 3</small>
                </div>
              )}
              <Button type="submit" className="full" icon="ArrowRight">
                {recovery
                  ? "Simular recuperación"
                  : signup
                    ? step < 2
                      ? "Siguiente"
                      : "Comenzar mi camino"
                    : "Iniciar sesión"}
              </Button>
            </form>
          )}
          {!recovery && (
            <>
              <div className="auth-alternative">
                {signup ? "¿Ya eres parte?" : "¿Es tu primera vez?"}{" "}
                <button onClick={() => go(signup ? "/login" : "/registro")}>
                  {signup ? "Iniciar sesión" : "Crea tu cuenta"}
                </button>
              </div>
              <div className="auth-divider">
                <span>o echa un vistazo</span>
              </div>
              <button className="demo-access" onClick={() => go("/inicio")}>
                Entrar a la demo sin registro <ArrowUpRight size={16} />
              </button>
            </>
          )}
          <p className="auth-disclaimer">
            <ShieldCheck size={15} /> Acceso simulado. Usa datos ficticios; no
            guardamos contraseñas.
          </p>
        </section>
        <aside className="auth-visual">
          <div className="auth-glow" />
          <div className="auth-art-label">
            <Sparkles size={16} /> UN ALIADO EN CADA PASO
          </div>
          <Mascot name={signup && step === 2 ? "welcome" : "doctor"} />
          <div className="mascot-platform" />
          <blockquote>
            El conocimiento se construye.
            <br />
            <strong>La confianza también.</strong>
          </blockquote>
          <span className="auth-spark">✦</span>
        </aside>
      </main>
      <footer className="auth-footer">
        Cada pequeño paso cuenta. Este puede ser el primero.
      </footer>
    </div>
  );
}

function Dashboard({ profile, history, completed, go, openModal }) {
  const last = history.find((h) => !h.isCards);
  const avg = last ? (last.score / 10).toFixed(1) : "8.2";
  const day = Math.min(
    6,
    missions.findIndex((_, i) => !completed.includes(i)) === -1
      ? 6
      : missions.findIndex((_, i) => !completed.includes(i)),
  );
  return (
    <>
      <PageTitle
        eyebrow="TU CONSTANCIA TE TRAJO HASTA AQUÍ"
        title={
          <>
            ¡Vamos con todo,{" "}
            <span className="text-cyan">{profile.name.split(" ")[0]}!</span>{" "}
            <span className="greeting-spark">✦</span>
          </>
        }
        subtitle="Hoy es un buen día para acercarte a tu residencia."
        action={
          <Tag color="purple">
            <Crown size={13} /> Plan {profile.plan}
          </Tag>
        }
      />
      <div className="dashboard-grid">
        <section className="mission-card">
          <div className="mission-copy">
            <Tag color="lime">
              <span className="status-dot" /> TU MISIÓN DE HOY
            </Tag>
            <h2>
              Tu meta está
              <br />
              <span>un reto más cerca.</span>
            </h2>
            <p>{missions[day]}</p>
            <div className="mission-meta">
              <span>
                <BookOpen size={14} /> 30 preguntas
              </span>
              <span>
                <Clock3 size={14} /> ~20 min
              </span>
            </div>
            <Button
              icon="ArrowRight"
              onClick={() => openModal({ type: "mission", day })}
            >
              Comenzar misión
            </Button>
            <span className="mission-footnote">
              En la demo recorrerás 5 preguntas.
            </span>
          </div>
          <div className="mission-art">
            <div />
            <Mascot name="welcome" />
            <span className="mission-star">✦</span>
            <span className="mission-bubble">¡Tú puedes!</span>
          </div>
        </section>
        <section className="streak-card">
          <div className="streak-heading">
            <span className="icon-tile pink">
              <Flame size={21} />
            </span>
            <Tag color="pink">¡SIGUE ASÍ!</Tag>
          </div>
          <div className="streak-number">
            7 <span>días de racha</span>
          </div>
          <p>El hábito hace la diferencia.</p>
          <div className="week-streak">
            {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
              <div key={i}>
                <span>{d}</span>
                <i className={i === 6 ? "today" : ""}>
                  {i === 6 ? <Flame size={16} /> : <Check size={14} />}
                </i>
              </div>
            ))}
          </div>
          <small>
            <ShieldCheck size={13} /> Tienes 2 comodines para cuidar tu racha.
          </small>
        </section>
      </div>
      <div className="metric-grid">
        <div className="metric-card">
          <span className="icon-tile cyan">
            <Target />
          </span>
          <div>
            <span>
              Promedio actual{" "}
              <button
                aria-label="Cómo se calcula mi promedio"
                onClick={() => openModal({ type: "score" })}
              >
                <CircleHelp size={13} />
              </button>
            </span>
            <strong>
              {avg}
              <small> / 10</small>
            </strong>
          </div>
          <span className="metric-trend">
            <ArrowUpRight size={14} /> {last ? "Tu sesión" : "+0.6"}
          </span>
        </div>
        <div className="metric-card">
          <span className="icon-tile purple">
            <CheckCheck />
          </span>
          <div>
            <span>Preguntas respondidas</span>
            <strong>
              {240 +
                history
                  .filter((h) => !h.isCards)
                  .reduce((n, h) => n + h.total, 0)}
              <small> preguntas</small>
            </strong>
          </div>
        </div>
        <button
          className="metric-card"
          onClick={() => openModal({ type: "achievement" })}
        >
          <span className="icon-tile lime">
            <Trophy />
          </span>
          <div>
            <span>Un paso a la vez</span>
            <strong>
              {completed.length}
              <small> / 7 misiones</small>
            </strong>
          </div>
          <ChevronRight size={18} />
        </button>
      </div>
      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">DALE RITMO A TU PREPARACIÓN</span>
            <h2>¿Qué entrenamos hoy?</h2>
          </div>
          <button className="text-link" onClick={() => go("/quizzes")}>
            Ver todos <ArrowRight size={16} />
          </button>
        </div>
        <div className="quick-activities">
          {activities
            .filter((a) =>
              ["rapido", "inteligente", "flashcards"].includes(a.id),
            )
            .map((a) => (
              <button
                key={a.id}
                className={`quick-activity ${a.color}`}
                onClick={() => go(`/quizzes/${a.id}`)}
              >
                <span className={`activity-icon ${a.color}`}>
                  <Icon name={a.icon} size={26} />
                </span>
                <h3>{a.title}</h3>
                <p>{a.description}</p>
                <span className="activity-action">
                  Vamos a ello <ArrowUpRight size={17} />
                </span>
              </button>
            ))}
        </div>
      </section>
      <div className="dashboard-lower">
        <section className="panel roadmap-preview">
          <div className="section-heading">
            <h2>Tu camino, paso a paso</h2>
            <Tag color="cyan">SEMANA 01</Tag>
          </div>
          <div className="mini-route">
            {missions.map((m, i) => (
              <button
                aria-label={`Día ${i + 1}: ${m}`}
                key={m}
                className={
                  completed.includes(i) ? "done" : i === day ? "current" : ""
                }
                onClick={() => go("/enarmapa")}
              >
                {completed.includes(i) ? (
                  <Check size={18} />
                ) : i === day ? (
                  <Zap size={18} />
                ) : i === 6 ? (
                  <Trophy size={16} />
                ) : (
                  <LockKeyhole size={14} />
                )}
              </button>
            ))}
          </div>
          <div className="panel-bottom">
            <p>{completed.length} de 7 misiones completadas</p>
            <button className="text-link" onClick={() => go("/enarmapa")}>
              Mi ENARMapa <ArrowRight size={15} />
            </button>
          </div>
        </section>
        <section className="tip-card">
          <span className="icon-tile pink">
            <Lightbulb />
          </span>
          <div>
            <span className="eyebrow">UN CONSEJO DE TU COMPAÑERO</span>
            <h3>No tienes que saberlo todo hoy.</h3>
            <p>
              Solo un poco más que ayer. Un repaso de 10 minutos también cuenta.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

function QuizHub({ go }) {
  return (
    <>
      <PageTitle
        eyebrow="CADA PREGUNTA TE ACERCA"
        title={
          <>
            Entrena a <span className="text-pink">tu manera.</span>
          </>
        }
        subtitle="Elige tu reto de hoy. Nosotros te acompañamos."
      />
      <div className="quiz-hub">
        {activities.map((a, i) => (
          <button
            className={`quiz-tile ${a.color}`}
            key={a.id}
            onClick={() => go(`/quizzes/${a.id}`)}
          >
            <div className="quiz-tile-top">
              <span className={`activity-icon ${a.color}`}>
                <Icon name={a.icon} size={30} />
              </span>
              {a.label ? (
                <Tag color={a.color}>{a.label}</Tag>
              ) : (
                <span className="tile-index">0{i + 1}</span>
              )}
            </div>
            <h2>{a.title}</h2>
            <p>{a.description}</p>
            <div className="tile-footer">
              <span>
                {a.id === "historial"
                  ? "Ver mis sesiones"
                  : "Comenzar a entrenar"}
              </span>
              <ArrowUpRight size={21} />
            </div>
          </button>
        ))}
      </div>
      <div className="callout hub-callout">
        <Lightbulb size={25} />
        <div>
          <strong>La constancia vale más que la intensidad.</strong>
          <p>
            Encuentra el formato que más disfrutas y haz del estudio un hábito.
          </p>
        </div>
      </div>
    </>
  );
}

function QuizSetup({ mode, marked, start, go }) {
  const a = activities.find((a) => a.id === mode);
  const [count, setCount] = useState(20);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [topics, setTopics] = useState([]);
  if (!a)
    return (
      <EmptyState
        title="Este reto aún no existe"
        text="Encuentra tu siguiente actividad en Quizzes."
        action="Ver quizzes"
        onClick={() => go("/quizzes")}
      />
    );
  const isCustom = mode === "personalizado";
  const isCards = mode === "flashcards";
  const filteredTopics = [
    ...new Set(
      questions
        .filter((q) => !selected.length || selected.includes(q.area))
        .map((q) => q.topic),
    ),
  ].filter((t) =>
    t.toLocaleLowerCase("es").includes(search.toLocaleLowerCase("es")),
  );
  return (
    <>
      <button className="back-link" onClick={() => go("/quizzes")}>
        <ArrowLeft size={17} /> Todos los quizzes
      </button>
      <PageTitle
        eyebrow="PREPARA TU ENTRENAMIENTO"
        title={a.title}
        subtitle={a.detail}
      />
      <div className="setup-layout">
        <section className="panel setup-form">
          <div className="setup-section">
            <div className="numbered-title">
              <span>01</span>
              <h2>¿Cuánto quieres practicar?</h2>
            </div>
            <p className="muted">Elige el tamaño de tu sesión.</p>
            <div className="count-options">
              {[20, 50, 100].map((n) => (
                <button
                  key={n}
                  aria-pressed={count === n}
                  className={count === n ? "selected" : ""}
                  onClick={() => setCount(n)}
                >
                  <strong>{n}</strong>
                  <span>{isCards ? "tarjetas" : "preguntas"}</span>
                  <small>
                    <Zap size={12} /> {n / 5} tokens
                  </small>
                  {count === n && (
                    <CheckCircle2 className="count-check" size={18} />
                  )}
                </button>
              ))}
            </div>
          </div>
          {isCustom && (
            <>
              <div className="setup-section">
                <div className="numbered-title">
                  <span>02</span>
                  <h2>Elige tus áreas</h2>
                </div>
                <p className="muted">Puedes seleccionar más de una.</p>
                <div className="area-picker">
                  {areas.map((a) => (
                    <button
                      className={selected.includes(a.name) ? "selected" : ""}
                      aria-pressed={selected.includes(a.name)}
                      key={a.name}
                      onClick={() => {
                        setSelected((s) =>
                          s.includes(a.name)
                            ? s.filter((x) => x !== a.name)
                            : [...s, a.name],
                        );
                        setTopics([]);
                      }}
                    >
                      <Icon name={a.icon} />
                      <span>{a.short}</span>
                      {selected.includes(a.name) && <Check size={16} />}
                    </button>
                  ))}
                </div>
              </div>
              <div className="setup-section">
                <div className="numbered-title">
                  <span>03</span>
                  <h2>
                    Afina por tema <small>Opcional</small>
                  </h2>
                </div>
                <Field
                  label="Buscar temas"
                  placeholder="Cardiología, farmacología…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="topic-chips">
                  {filteredTopics.map((t) => (
                    <button
                      key={t}
                      className={topics.includes(t) ? "selected" : ""}
                      aria-pressed={topics.includes(t)}
                      onClick={() =>
                        setTopics((s) =>
                          s.includes(t) ? s.filter((x) => x !== t) : [...s, t],
                        )
                      }
                    >
                      {t}
                      {topics.includes(t) && <Check size={13} />}
                    </button>
                  ))}
                  {!filteredTopics.length && (
                    <p className="muted">
                      No hay temas de ejemplo con ese nombre.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
          {!isCustom && (
            <div className="setup-distribution">
              <h3>
                {isCards
                  ? "Tus preguntas, a un giro de distancia"
                  : mode === "inteligente"
                    ? "Más aprendizaje, menos presión"
                    : "Un entrenamiento equilibrado"}
              </h3>
              <p>
                {isCards
                  ? `Tienes ${marked.length} preguntas marcadas listas para repasar. Revela cada respuesta y evalúa qué tan fácil fue recordarla.`
                  : mode === "inteligente"
                    ? "Revela la respuesta y evalúa lo que recuerdas. Este repaso no modifica tu promedio."
                    : "Practica Medicina Interna, Pediatría, Ginecología y Obstetricia, y Cirugía en una sola sesión."}
              </p>
              <div className="distribution-bar">
                <i />
                <i />
                <i />
                <i />
              </div>
            </div>
          )}
        </section>
        <aside className="setup-summary panel">
          <span className={`activity-icon ${a.color}`}>
            <Icon name={a.icon} size={28} />
          </span>
          <h2>Tu próximo reto</h2>
          <div className="summary-row">
            <span>Actividad</span>
            <strong>{a.title}</strong>
          </div>
          <div className="summary-row">
            <span>{isCards ? "Tarjetas" : "Preguntas"}</span>
            <strong>{count}</strong>
          </div>
          <div className="summary-row">
            <span>Áreas</span>
            <strong>
              {isCustom && selected.length ? selected.length : "Todas"}
            </strong>
          </div>
          <div className="summary-row">
            <span>Tiempo estimado</span>
            <strong>{count} min</strong>
          </div>
          <div className="demo-note">
            <Sparkles size={18} />
            <p>
              <strong>Un vistazo al recorrido.</strong> Esta demo usa hasta 5
              preguntas de ejemplo.
            </p>
          </div>
          <Button
            className="full"
            icon="ArrowRight"
            disabled={
              (isCustom && !selected.length) || (isCards && !marked.length)
            }
            onClick={() => start(mode, selected, null, topics)}
          >
            Comenzar {isCards ? "repaso" : "quiz"}
          </Button>
          {isCustom && !selected.length && (
            <small className="muted">
              Selecciona al menos un área para comenzar.
            </small>
          )}
          {isCards && !marked.length && (
            <button className="text-link" onClick={() => go("/quizzes/rapido")}>
              Haz un quiz y marca preguntas <ArrowRight size={14} />
            </button>
          )}
          <span className="setup-reassurance">
            <Heart size={13} /> Cada intento es una oportunidad.
          </span>
        </aside>
      </div>
    </>
  );
}

function QuizRunner({
  session,
  setSession,
  marked,
  toggleMark,
  finish,
  openModal,
}) {
  const q = session.questions[session.current];
  const isCards = ["flashcards", "inteligente"].includes(session.mode);
  const [revealed, setRevealed] = useState(false);
  const [pendingFinish, setPendingFinish] = useState(false);
  useEffect(() => {
    setRevealed(false);
  }, [session.current]);
  useEffect(() => {
    if (pendingFinish) finish();
  }, [pendingFinish, finish]);
  const title =
    session.mission !== null
      ? missions[session.mission]
      : activities.find((a) => a.id === session.mode)?.title;
  const selected = session.answers[q.id];
  const rate = (rating) => {
    setSession((s) => ({
      ...s,
      ratings: [...s.ratings, rating],
      current: Math.min(s.current + 1, s.questions.length - 1),
    }));
    if (session.current === session.questions.length - 1)
      setPendingFinish(true);
  };
  return (
    <div className="quiz-runner">
      <div className="runner-top">
        <button
          className="back-link"
          onClick={() => openModal({ type: "exit", next: "/quizzes" })}
        >
          <X size={18} /> Salir
        </button>
        <span>{title}</span>
        {!isCards ? (
          <button
            className="icon-button"
            aria-label="Abrir mapa de preguntas"
            onClick={() => openModal({ type: "questionMap" })}
          >
            <LayoutGrid size={19} />
          </button>
        ) : (
          <Layers size={20} />
        )}
      </div>
      <div className="runner-progress-label">
        <span>
          {isCards ? "Tarjeta" : "Pregunta"}{" "}
          <strong>{session.current + 1}</strong> de {session.questions.length}
        </span>
        <span>
          {isCards
            ? `${session.ratings.length} repasadas`
            : `${Object.keys(session.answers).length} respondidas`}
        </span>
      </div>
      <Progress
        value={((session.current + 1) / session.questions.length) * 100}
      />
      <div className="question-meta">
        <Tag color="cyan">{q.area}</Tag>
        <button
          className={`mark-button ${marked.includes(q.id) ? "marked" : ""}`}
          onClick={() => toggleMark(q.id)}
          aria-pressed={marked.includes(q.id)}
        >
          <Bookmark
            size={17}
            fill={marked.includes(q.id) ? "currentColor" : "none"}
          />
          <span>{marked.includes(q.id) ? "Marcada" : "Marcar"}</span>
        </button>
      </div>
      <section className={`question-panel ${isCards ? "flashcard" : ""}`}>
        <span className="eyebrow">
          {isCards
            ? revealed
              ? "CONECTA LO QUE APRENDISTE"
              : "PIENSA ANTES DE GIRAR"
            : q.topic.toUpperCase()}
        </span>
        <h1>{q.text}</h1>
        {isCards ? (
          <>
            {revealed ? (
              <div className="flash-answer">
                <Tag color="lime">RESPUESTA</Tag>
                <h2>{q.options[q.answer]}</h2>
                <p>{q.explanation}</p>
              </div>
            ) : (
              <button
                className="reveal-button"
                onClick={() => setRevealed(true)}
              >
                <RotateCcw size={24} />
                <span>Revelar respuesta</span>
                <small>Tómate tu tiempo. Recordar es entrenar.</small>
              </button>
            )}
          </>
        ) : (
          <div className="answer-options">
            {q.options.map((o, i) => (
              <button
                key={o}
                onClick={() =>
                  setSession((s) => ({
                    ...s,
                    answers: { ...s.answers, [q.id]: i },
                  }))
                }
                aria-pressed={selected === i}
                className={selected === i ? "selected" : ""}
              >
                <span className="answer-letter">{"ABCD"[i]}</span>
                <span>{o}</span>
                <span className="answer-radio">
                  {selected === i && <Check size={14} />}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
      {isCards ? (
        revealed && (
          <div className="flash-rating">
            <p>¿Qué tan fácil fue recordarlo?</p>
            <div>
              {[
                { name: "Difícil", color: "pink", icon: "RotateCcw" },
                { name: "Regular", color: "purple", icon: "BrainCircuit" },
                { name: "Fácil", color: "lime", icon: "Check" },
              ].map((r) => (
                <button
                  key={r.name}
                  className={r.color}
                  onClick={() => rate(r.name)}
                >
                  <Icon name={r.icon} size={19} />
                  {r.name}
                </button>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="runner-controls">
          <Button
            secondary
            icon="ArrowLeft"
            disabled={session.current === 0}
            onClick={() =>
              setSession((s) => ({ ...s, current: s.current - 1 }))
            }
          >
            Anterior
          </Button>
          {session.current === session.questions.length - 1 ? (
            <Button icon="Check" onClick={() => openModal({ type: "finish" })}>
              Terminar quiz
            </Button>
          ) : (
            <Button
              icon="ArrowRight"
              onClick={() =>
                setSession((s) => ({ ...s, current: s.current + 1 }))
              }
            >
              Siguiente
            </Button>
          )}
        </div>
      )}
      <div className="runner-note">
        <ShieldCheck size={14} /> Contenido ilustrativo para explorar el flujo,
        no es un banco validado.
      </div>
    </div>
  );
}

function Results({ result, go, marked, toggleMark }) {
  const [review, setReview] = useState(false);
  const [filter, setFilter] = useState("Todas");
  const list = result.questions.filter(
    (q) =>
      filter === "Todas" ||
      (filter === "Errores"
        ? result.answers[q.id] !== q.answer
        : result.answers[q.id] === q.answer),
  );
  if (review)
    return (
      <>
        <button className="back-link" onClick={() => setReview(false)}>
          <ArrowLeft size={17} /> Mi resultado
        </button>
        <PageTitle
          eyebrow="AQUÍ ES DONDE MÁS APRENDES"
          title="Un repaso que suma."
          subtitle="Conecta cada respuesta con lo que ya sabes."
        />
        <div className="filter-tabs">
          {["Todas", "Aciertos", "Errores"].map((f) => (
            <button
              className={filter === f ? "active" : ""}
              key={f}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="review-list">
          {list.map((q, i) => {
            const correct = result.answers[q.id] === q.answer;
            return (
              <article className="panel review-card" key={q.id}>
                <div className="section-heading">
                  <Tag color={correct ? "lime" : "pink"}>
                    {correct ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <CircleX size={14} />
                    )}
                    {correct
                      ? "Correcta"
                      : result.answers[q.id] === undefined
                        ? "Sin responder"
                        : "Para reforzar"}
                  </Tag>
                  <button
                    className={`mark-button ${marked.includes(q.id) ? "marked" : ""}`}
                    onClick={() => toggleMark(q.id)}
                    aria-pressed={marked.includes(q.id)}
                  >
                    <Bookmark size={16} />
                    {marked.includes(q.id) ? "Marcada" : "Marcar"}
                  </button>
                </div>
                <span className="eyebrow">
                  {q.area} · {q.topic}
                </span>
                <h3>
                  {i + 1}. {q.text}
                </h3>
                {!correct && (
                  <p className="wrong-answer">
                    Tu respuesta:{" "}
                    {q.options[result.answers[q.id]] || "Sin responder"}
                  </p>
                )}
                <p className="right-answer">
                  <Check size={17} /> {q.options[q.answer]}
                </p>
                <div className="explanation">
                  <Lightbulb size={18} />
                  <p>{q.explanation}</p>
                </div>
              </article>
            );
          })}
          {!list.length && (
            <div className="panel">
              <p>No hay preguntas en este filtro. ¡Sigue entrenando!</p>
            </div>
          )}
        </div>
      </>
    );
  return (
    <div className="results">
      <div className="results-visual">
        <div className="result-glow" />
        <Mascot name="celebrate" />
      </div>
      <div className="eyebrow">UN PASO MÁS HACIA TU META</div>
      <h1>
        ¡Ese esfuerzo <span className="text-pink">cuenta!</span>
      </h1>
      <p>
        {result.isCards
          ? "Cada vez que recuerdas, haces más fuerte tu conocimiento."
          : "Aprendiste, practicaste y seguiste adelante. Eso también es ganar."}
      </p>
      <Tag color="purple">{result.title}</Tag>
      <div className="results-metrics">
        {result.isCards ? (
          <>
            {["Difícil", "Regular", "Fácil"].map((r) => (
              <div key={r}>
                <strong>{result.ratings.filter((x) => x === r).length}</strong>
                <span>{r}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div>
              <strong className="text-cyan">
                {result.score}
                <small>%</small>
              </strong>
              <span>Tu resultado</span>
            </div>
            <div>
              <strong>
                {result.correct}
                <small>/{result.total}</small>
              </strong>
              <span>Respuestas correctas</span>
            </div>
            <div>
              <strong className="text-pink">
                {result.total - result.correct}
              </strong>
              <span>Para seguir aprendiendo</span>
            </div>
          </>
        )}
      </div>
      <div className="results-actions">
        {!result.isCards && (
          <Button icon="BookOpen" onClick={() => setReview(true)}>
            Revisar mis respuestas
          </Button>
        )}
        <Button
          secondary
          icon="ArrowRight"
          onClick={() => go(result.mission !== null ? "/enarmapa" : "/quizzes")}
        >
          {result.mission !== null ? "Volver a mi ruta" : "Seguir entrenando"}
        </Button>
      </div>
      <button className="text-link" onClick={() => go("/inicio")}>
        Volver al inicio
      </button>
    </div>
  );
}

function Roadmap({ completed, openModal }) {
  const next = missions.findIndex((_, i) => !completed.includes(i));
  return (
    <>
      <PageTitle
        eyebrow="TU GRAN META SE CONSTRUYE DÍA A DÍA"
        title={
          <>
            Este es <span className="text-cyan">tu camino.</span>
          </>
        }
        subtitle="Siete días, siete oportunidades de crecer. Vamos paso a paso."
        action={
          <button
            className="streak-badge"
            onClick={() => openModal({ type: "achievement" })}
          >
            <Flame size={20} /> 7 días de racha
          </button>
        }
      />
      <div className="roadmap-layout">
        <section className="map-panel">
          <div className="map-banner">
            <span className="icon-tile cyan">
              <Map />
            </span>
            <div>
              <span className="eyebrow">SEMANA 01</span>
              <h2>Conoce tu punto de partida</h2>
            </div>
            <span>{completed.length}/7</span>
          </div>
          <div className="roadmap-track">
            {missions.map((m, i) => {
              const done = completed.includes(i);
              const active = next === i;
              return (
                <div
                  className={`roadmap-stop ${i % 2 ? "right" : "left"} ${done ? "done" : active ? "current" : "locked"}`}
                  key={m}
                >
                  <button
                    className="map-node"
                    aria-label={`Día ${i + 1}: ${m}${done ? ", completada" : active ? ", disponible" : ", bloqueada"}`}
                    onClick={() =>
                      openModal({
                        type: done || active ? "mission" : "locked",
                        day: i,
                      })
                    }
                  >
                    {done ? (
                      <Check size={29} />
                    ) : active ? (
                      <Zap size={30} fill="currentColor" />
                    ) : i === 6 ? (
                      <Trophy size={27} />
                    ) : (
                      <LockKeyhole size={22} />
                    )}
                  </button>
                  <button
                    className="map-stop-label"
                    onClick={() =>
                      openModal({
                        type: done || active ? "mission" : "locked",
                        day: i,
                      })
                    }
                  >
                    <span>
                      DÍA {i + 1} {done && "· COMPLETADO"}{" "}
                      {active && "· TE TOCA"}
                    </span>
                    <strong>{m}</strong>
                    {active && (
                      <small>
                        ¡Vamos a por ello! <ArrowRight size={13} />
                      </small>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="map-finish">
            <Trophy size={20} />
            <span>Tu primera insignia está en camino.</span>
          </div>
        </section>
        <aside className="map-aside">
          <div className="panel week-summary">
            <Tag color="lime">TU AVANCE</Tag>
            <h2>
              Una semana
              <br />
              para descubrirte.
            </h2>
            <p>
              Conoce tus fortalezas y encuentra las áreas donde puedes mejorar.
            </p>
            <Progress value={(completed.length / 7) * 100} />
            <span>{completed.length} de 7 misiones completadas</span>
            <div className="map-reward">
              <Trophy size={30} />
              <div>
                <strong>Primer mapa clínico</strong>
                <small>Completa tu primera semana.</small>
              </div>
            </div>
          </div>
          <div className="map-mascot">
            <Mascot name="doctor" />
            <p>
              “No corras. Solo no dejes
              <br />
              de dar el siguiente paso.”
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function Stats({ history, openModal }) {
  const [tab, setTab] = useState("Resumen");
  const [period, setPeriod] = useState("Esta semana");
  const real = history.filter((h) => !h.isCards);
  const total = real.reduce((n, h) => n + h.total, 240);
  const correct = real.reduce((n, h) => n + h.correct, 197);
  return (
    <>
      <PageTitle
        eyebrow="TU ESFUERZO, EN PERSPECTIVA"
        title={
          <>
            Mira cuánto <span className="text-pink">has crecido.</span>
          </>
        }
        subtitle="Cada respuesta cuenta una parte de tu progreso."
        action={
          <label className="period-select">
            <span className="sr-only">Periodo de estadísticas</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option>Esta semana</option>
              <option>Este mes</option>
            </select>
          </label>
        }
      />
      <div className="filter-tabs">
        {["Resumen", "Análisis por área"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={tab === t ? "active" : ""}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Resumen" ? (
        <>
          <div className="stats-top">
            <section className="panel stats-average">
              <div>
                <span className="eyebrow">PROMEDIO HISTÓRICO</span>
                <h2>
                  {((correct / total) * 10).toFixed(1)}
                  <small>/ 10</small>
                </h2>
                <Tag color="lime">
                  <ArrowUpRight size={14} /> Cada día cuenta
                </Tag>
              </div>
              <div
                className="score-ring"
                style={{ "--score": `${(correct / total) * 100}%` }}
              >
                <span>
                  <Target size={23} />
                  <strong>{Math.round((correct / total) * 100)}%</strong>
                  <small>de aciertos</small>
                </span>
              </div>
            </section>
            <div className="stats-small-grid">
              {[
                {
                  icon: "BookOpen",
                  value: total,
                  label: "Respuestas",
                  color: "cyan",
                },
                {
                  icon: "CheckCheck",
                  value: correct,
                  label: "Aciertos",
                  color: "lime",
                },
                {
                  icon: "RotateCcw",
                  value: total - correct,
                  label: "Por reforzar",
                  color: "pink",
                },
                {
                  icon: "Target",
                  value: "24%",
                  label: "Exposición al banco",
                  color: "purple",
                },
              ].map((s) => (
                <div className="panel stat-small" key={s.label}>
                  <span className={`icon-tile ${s.color}`}>
                    <Icon name={s.icon} size={18} />
                  </span>
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
          <section className="panel progress-chart">
            <div className="section-heading">
              <div>
                <span className="eyebrow">CONSTRUYENDO TU MEJOR VERSIÓN</span>
                <h2>
                  Tu progreso {period === "Esta semana" ? "semanal" : "mensual"}
                </h2>
              </div>
              <Tag color="purple">DATOS DE EJEMPLO</Tag>
            </div>
            <div
              className="chart-container"
              role="img"
              aria-label={
                period === "Esta semana"
                  ? "Promedios de ejemplo: lunes 6.2, martes 7, miércoles 6.8, jueves 7.6, viernes 7.3, sábado 8 y domingo 8.2."
                  : "Promedios mensuales de ejemplo: semana 1, 6.4; semana 2, 7; semana 3, 7.6; semana 4, 8.2."
              }
            >
              <div className="chart-labels">
                <span>10</span>
                <span>8</span>
                <span>6</span>
                <span>4</span>
              </div>
              <div className="chart-plot">
                <div className="chart-grid">
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <svg
                  viewBox="0 0 700 170"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#b690ed" stopOpacity=".28" />
                      <stop offset="100%" stopColor="#b690ed" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={
                      period === "Esta semana"
                        ? "M0,120 L116,95 L232,103 L348,73 L464,85 L580,55 L700,43 L700,170 L0,170 Z"
                        : "M0,115 L233,97 L466,70 L700,43 L700,170 L0,170 Z"
                    }
                    fill="url(#chartFill)"
                  />
                  <path
                    d={
                      period === "Esta semana"
                        ? "M0,120 L116,95 L232,103 L348,73 L464,85 L580,55 L700,43"
                        : "M0,115 L233,97 L466,70 L700,43"
                    }
                    fill="none"
                    stroke="#b690ed"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle cx="699" cy="43" r="5" fill="#c9f35b" />
                </svg>
                <div className="chart-x">
                  {(period === "Esta semana"
                    ? ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
                    : ["Semana 1", "Semana 2", "Semana 3", "Semana 4"]
                  ).map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <div className="strength-grid">
            <button
              className="panel strength-card"
              onClick={() =>
                openModal({
                  type: "area",
                  area: areas[3],
                  title: "Tu fortaleza",
                })
              }
            >
              <span className="icon-tile lime">
                <Trophy />
              </span>
              <div>
                <span>Tu área más fuerte</span>
                <h3>Cirugía</h3>
                <p>¡Sigue afianzando lo que sabes!</p>
              </div>
              <strong>
                88% <ChevronRight size={16} />
              </strong>
            </button>
            <button
              className="panel strength-card"
              onClick={() =>
                openModal({
                  type: "area",
                  area: areas[2],
                  title: "Tu siguiente oportunidad",
                })
              }
            >
              <span className="icon-tile pink">
                <Target />
              </span>
              <div>
                <span>Tu próxima oportunidad</span>
                <h3>Gineco y Obstetricia</h3>
                <p>Un repaso puede hacer la diferencia.</p>
              </div>
              <strong>
                68% <ChevronRight size={16} />
              </strong>
            </button>
          </div>
        </>
      ) : (
        <section className="panel area-analysis">
          <div className="section-heading">
            <h2>Un vistazo a cada área</h2>
            <Tag color="purple">EJEMPLO</Tag>
          </div>
          {areas.map((a) => (
            <button
              key={a.name}
              onClick={() =>
                openModal({ type: "area", area: a, title: a.name })
              }
            >
              <span className={`icon-tile ${a.color}`}>
                <Icon name={a.icon} />
              </span>
              <div>
                <div>
                  <strong>{a.name}</strong>
                  <span>{a.score}%</span>
                </div>
                <Progress value={a.score} color={a.color} />
              </div>
              <ChevronRight size={18} />
            </button>
          ))}
        </section>
      )}
    </>
  );
}

function HistoryPage({ history, go, openModal }) {
  const [filter, setFilter] = useState("Todas");
  const all = [...history, ...sampleHistory];
  const filtered = all.filter(
    (h) =>
      filter === "Todas" || (filter === "Quizzes" ? !h.isCards : h.isCards),
  );
  return (
    <>
      <button className="back-link" onClick={() => go("/quizzes")}>
        <ArrowLeft size={17} /> Todos los quizzes
      </button>
      <PageTitle
        eyebrow="CADA SESIÓN DEJA HUELLA"
        title="Tu historial de esfuerzo."
        subtitle="Regresa a lo que aprendiste. Descubre cuánto has avanzado."
      />
      <div className="filter-tabs">
        {["Todas", "Quizzes", "Repasos"].map((f) => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="history-list">
        {filtered.map((h) => (
          <button
            className="panel history-row"
            key={h.id}
            onClick={() =>
              h.id.startsWith("sample")
                ? openModal({ type: "sample", item: h })
                : go(`/resultados/${h.id}`)
            }
          >
            <span className={`icon-tile ${h.isCards ? "cyan" : "purple"}`}>
              <Icon name={h.isCards ? "Layers" : "Zap"} />
            </span>
            <div>
              <h3>{h.title}</h3>
              <p>
                {h.date} · {h.total} {h.isCards ? "tarjetas" : "preguntas"}
                {h.id.startsWith("sample") && " · Ejemplo"}
              </p>
            </div>
            <div className="history-score">
              <strong>{h.isCards ? "Completado" : `${h.score}%`}</strong>
              <small>
                {h.isCards ? "Ver resumen" : `${h.correct} aciertos`}
              </small>
            </div>
            <ChevronRight size={20} />
          </button>
        ))}
        {!filtered.length && (
          <EmptyState
            title="Aquí empieza tu siguiente hábito"
            text="Completa un repaso para verlo en tu historial."
            action="Explorar flashcards"
            onClick={() => go("/quizzes/flashcards")}
          />
        )}
      </div>
    </>
  );
}

function Profile({ profile, marked, go, openModal }) {
  return (
    <>
      <PageTitle
        eyebrow="ESTE CAMINO LLEVA TU NOMBRE"
        title="Tu espacio."
        subtitle="Tu cuenta, tus metas y lo que te hace avanzar."
      />
      <div className="profile-layout">
        <section className="panel profile-card">
          <div className="profile-avatar">
            {profile.name.charAt(0).toUpperCase()}
            <span>
              <GraduationCap size={22} />
            </span>
          </div>
          <h2>
            {profile.name} {profile.lastname}
          </h2>
          <p>{profile.email}</p>
          <Tag color="cyan">FUTURO RESIDENTE</Tag>
          <div className="profile-goal">
            <span>MI META</span>
            <h3>{profile.specialty}</h3>
            <small>ENARM {profile.target}</small>
          </div>
          <Button
            secondary
            icon="Settings"
            onClick={() => go("/configuracion")}
          >
            Editar mi perfil
          </Button>
        </section>
        <div className="profile-options">
          <section className="panel profile-menu">
            {[
              {
                title: "Configuración",
                subtitle: "Tu perfil y tus preferencias",
                icon: "Settings",
                path: "/configuracion",
                color: "purple",
              },
              {
                title: "Preguntas marcadas",
                subtitle: `${marked.length} ideas para volver a repasar`,
                icon: "Bookmark",
                path: "/marcadas",
                color: "pink",
              },
              {
                title: "Mi historial",
                subtitle: "Todo lo que has entrenado",
                icon: "History",
                path: "/quizzes/historial",
                color: "cyan",
              },
              {
                title: "Ayuda y soporte",
                subtitle: "Siempre hay una mano cerca",
                icon: "CircleHelp",
                path: "/ayuda",
                color: "lime",
              },
            ].map((item) => (
              <button key={item.title} onClick={() => go(item.path)}>
                <span className={`icon-tile ${item.color}`}>
                  <Icon name={item.icon} />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.subtitle}</small>
                </div>
                <ChevronRight size={18} />
              </button>
            ))}
          </section>
          <button className="premium-banner" onClick={() => go("/planes")}>
            <span className="icon-tile pink">
              <Crown />
            </span>
            <div>
              <span className="eyebrow">ENTRENARME PREMIUM</span>
              <h3>Tu potencial merece más.</h3>
              <p>Descubre todo lo que puedes desbloquear.</p>
            </div>
            <ArrowUpRight />
          </button>
          <button
            className="logout-button"
            onClick={() => openModal({ type: "logout" })}
          >
            <LogOut size={18} /> Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}

function Plans({ profile, select }) {
  return (
    <>
      <PageTitle
        eyebrow="UNA META. DISTINTAS FORMAS DE LLEGAR."
        title={
          <>
            Dale espacio a <span className="text-pink">tu potencial.</span>
          </>
        }
        subtitle="Compara los planes y prueba el cambio de forma simulada."
      />
      <div className="plans-grid">
        {["Básico", "Premium"].map((p, i) => (
          <section className={`panel plan-card ${i ? "premium" : ""}`} key={p}>
            {i ? (
              <Tag color="pink">
                <Sparkles size={13} /> PARA IR UN PASO MÁS ALLÁ
              </Tag>
            ) : (
              <Tag color="cyan">EMPIEZA A TU RITMO</Tag>
            )}
            <Icon name={i ? "Crown" : "Zap"} size={34} />
            <h2>{p}</h2>
            <p>
              {i
                ? "Más posibilidades para tu preparación."
                : "Todo lo que necesitas para dar el primer paso."}
            </p>
            <div className="plan-price">
              {i ? "Sin límites" : "Gratis"}
              <small>
                {i ? "Vista previa de beneficios" : "Para comenzar"}
              </small>
            </div>
            <ul>
              {(i
                ? [
                    "Quizzes sin límite de tokens",
                    "Repaso inteligente completo",
                    "Configuración de quizzes por tema",
                    "Análisis detallado de tus resultados",
                    "Ruta ENARMapa y flashcards",
                  ]
                : [
                    "10 tokens diarios",
                    "Quiz rápido y quiz de repaso",
                    "Flashcards de preguntas marcadas",
                    "Estadísticas generales",
                    "Tu ruta personal en ENARMapa",
                  ]
              ).map((f) => (
                <li key={f}>
                  <Check size={17} />
                  {f}
                </li>
              ))}
            </ul>
            <Button
              secondary={!i}
              className="full"
              disabled={profile.plan === p}
              onClick={() => select(p)}
            >
              {profile.plan === p ? "Tu plan actual" : `Probar plan ${p}`}
            </Button>
          </section>
        ))}
      </div>
      <p className="plans-note">
        <ShieldCheck size={16} /> Selección de prueba. No hay pagos,
        suscripciones ni cargos reales.
      </p>
    </>
  );
}

function SettingsPage({
  profile,
  saved,
  setSaved,
  updateProfile,
  notify,
  go,
  reset,
}) {
  const [form, setForm] = useState(profile);
  const [reminders, setReminders] = useState(saved.reminders ?? true);
  const [sound, setSound] = useState(saved.sound ?? false);
  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  return (
    <>
      <button className="back-link" onClick={() => go("/perfil")}>
        <ArrowLeft size={17} /> Mi perfil
      </button>
      <PageTitle
        title="A tu manera."
        subtitle="Ajusta los detalles que hacen este espacio tuyo."
      />
      <form
        className="settings-layout"
        onSubmit={(e) => {
          e.preventDefault();
          updateProfile(form);
          setSaved((s) => ({ ...s, reminders, sound }));
          notify("Tus preferencias de demo se guardaron en este navegador.");
        }}
      >
        <section className="panel">
          <h2>Tu información</h2>
          <div className="two-fields">
            <Field
              label="Nombre"
              name="name"
              value={form.name}
              onChange={change}
              required
              maxLength={35}
            />
            <Field
              label="Apellidos"
              name="lastname"
              value={form.lastname}
              onChange={change}
              maxLength={60}
            />
          </div>
          <Field
            label="Correo electrónico de ejemplo"
            name="email"
            type="email"
            value={form.email}
            onChange={change}
            required
          />
          <label className="field">
            <span>Mi especialidad objetivo</span>
            <select name="specialty" value={form.specialty} onChange={change}>
              {areas.map((a) => (
                <option key={a.name}>{a.name}</option>
              ))}
              <option>Aún estoy explorando</option>
            </select>
          </label>
          <label className="field">
            <span>Año del ENARM</span>
            <select name="target" value={form.target} onChange={change}>
              {["2026", "2027", "2028"].map((y) => (
                <option key={y}>{y}</option>
              ))}
            </select>
          </label>
        </section>
        <section className="panel preferences">
          <h2>Pequeños detalles</h2>
          {[
            {
              title: "Recordatorio de entrenamiento",
              desc: "Una invitación a seguir avanzando.",
              icon: "Bell",
              value: reminders,
              set: setReminders,
            },
            {
              title: "Sonidos de la app",
              desc: "Celebra cada pequeño logro.",
              icon: "Volume2",
              value: sound,
              set: setSound,
            },
          ].map((p) => (
            <div className="preference" key={p.title}>
              <Icon name={p.icon} />
              <div>
                <strong>{p.title}</strong>
                <p>{p.desc}</p>
              </div>
              <button
                className={`switch ${p.value ? "on" : ""}`}
                type="button"
                role="switch"
                aria-checked={p.value}
                aria-label={p.title}
                onClick={() => p.set(!p.value)}
              >
                <span />
              </button>
            </div>
          ))}
          <p className="small-text muted">
            Estas preferencias son visuales en la demo. No se envían
            notificaciones ni se reproduce audio.
          </p>
          <Button className="full" type="submit" icon="Check">
            Guardar cambios
          </Button>
          <button className="reset-demo" type="button" onClick={reset}>
            <RotateCcw size={15} /> Reiniciar recorrido de demo
          </button>
        </section>
      </form>
    </>
  );
}

function Help({ go }) {
  return (
    <>
      <button className="back-link" onClick={() => go("/perfil")}>
        <ArrowLeft size={17} /> Mi perfil
      </button>
      <PageTitle
        eyebrow="NINGUNA DUDA ES DEMASIADO PEQUEÑA"
        title="Estamos en tu equipo."
        subtitle="Un poco de claridad para seguir entrenando."
      />
      <div className="help-layout">
        <section className="faq-list">
          {[
            {
              q: "¿Cómo funciona esta demo?",
              a: "Este es un mockup navegable de Entrenarme. Puedes crear un perfil simulado, responder preguntas de ejemplo, marcar flashcards y recorrer las pantallas. El contenido y las estadísticas iniciales son ilustrativos.",
            },
            {
              q: "¿Cómo se calcula mi promedio?",
              a: "El flujo de referencia calcula el promedio con las últimas 280 preguntas calificadas y revisadas. En este mockup, el inicio muestra la última sesión de muestra que completaste. Las estadísticas parten de un conjunto de datos de ejemplo.",
            },
            {
              q: "¿Para qué sirven los tokens?",
              a: "Representan las sesiones de práctica disponibles. La referencia incluye tokens diarios, Tokens+ por constancia y comodines para cuidar la racha. En esta demo no se descuentan ni se compran.",
            },
            {
              q: "¿Qué es ENARMapa?",
              a: "Es tu ruta de estudio semanal. Empieza con diagnósticos por área y termina con un repaso semanal. Completar una misión de la demo desbloquea la siguiente.",
            },
            {
              q: "¿Dónde se guarda mi información?",
              a: "Solo en el navegador de este dispositivo. Se conservan el perfil de ejemplo, las preferencias, las preguntas marcadas y los resultados de la demo. Las contraseñas no se guardan y no hay servidor ni autenticación real.",
            },
            {
              q: "¿Ya puedo usar las preguntas para estudiar?",
              a: "Las cinco preguntas de muestra permiten explorar la interfaz. No constituyen un banco de preparación validado. El producto completo requeriría contenido y explicaciones revisados por especialistas.",
            },
          ].map((f) => (
            <details className="panel" key={f.q}>
              <summary>
                {f.q}
                <ChevronDown size={19} />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </section>
        <aside className="panel help-card">
          <span className="icon-tile cyan">
            <HeartPulse size={27} />
          </span>
          <h2>Hecho para acompañarte.</h2>
          <p>
            Explora a tu ritmo. Siempre puedes regresar al inicio y probar otro
            camino.
          </p>
          <Button secondary icon="ArrowRight" onClick={() => go("/inicio")}>
            Volver a mi espacio
          </Button>
          <small>Versión 1.0 · Mockup interactivo</small>
        </aside>
      </div>
    </>
  );
}

function Marked({ marked, toggleMark, go }) {
  const list = questions.filter((q) => marked.includes(q.id));
  return (
    <>
      <button className="back-link" onClick={() => go("/perfil")}>
        <ArrowLeft size={17} /> Mi perfil
      </button>
      <PageTitle
        eyebrow="GUARDA LO QUE QUIERES VOLVER A PENSAR"
        title="Ideas para el siguiente repaso."
        subtitle={`${list.length} preguntas marcadas en tu colección.`}
        action={
          list.length > 0 && (
            <Button icon="Layers" onClick={() => go("/quizzes/flashcards")}>
              Repasar flashcards
            </Button>
          )
        }
      />
      <div className="marked-list">
        {list.map((q) => (
          <article className="panel" key={q.id}>
            <div className="section-heading">
              <Tag color="cyan">{q.area}</Tag>
              <button
                className="icon-button text-pink"
                aria-label={`Desmarcar pregunta de ${q.topic}`}
                onClick={() => toggleMark(q.id)}
              >
                <Bookmark fill="currentColor" size={19} />
              </button>
            </div>
            <h3>{q.text}</h3>
            <span className="muted small-text">{q.topic}</span>
          </article>
        ))}
        {!list.length && (
          <EmptyState
            title="Tu colección empieza con una pregunta"
            text="Durante un quiz, toca el marcador para guardar lo que quieras repasar."
            action="Ir a quizzes"
            onClick={() => go("/quizzes")}
          />
        )}
      </div>
    </>
  );
}
function EmptyState({ title, text, action, onClick }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <BrainCircuit size={35} />
      </span>
      <h1>{title}</h1>
      <p>{text}</p>
      <Button onClick={onClick} icon="ArrowRight">
        {action}
      </Button>
    </div>
  );
}

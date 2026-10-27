import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { api } from "./api.js";
const BusyContext = createContext(false);
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
import { activities, areas, missions } from "./catalog.js";

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
  const busy = useContext(BusyContext);
  return (
    <button
      className={`${ghost ? "btn-ghost" : secondary ? "btn-secondary" : "btn-primary"} ${className}`}
      {...props}
      disabled={busy || props.disabled}
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
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState("");
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState(null);
  const [session, setSession] = useState(null);
  const [result, setResult] = useState(null);
  const [resultError, setResultError] = useState("");
  const toastTimer = useRef(null);
  const profile = saved?.profile;
  const marked = saved?.marked || [];
  const history = saved?.history || [];
  const completed = saved?.completed || [];
  const isPublic =
    ["/bienvenida", "/login", "/registro", "/recuperar"].includes(route) ||
    route.startsWith("/restablecer");
  const go = (path) => {
    window.location.hash = path;
  };
  const notify = (text) => {
    setToast(text);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 5000);
  };
  const accept = (data) => {
    setSaved(data);
    setSession(data.activeSession);
  };
  const restore = async () => {
    setLoading(true);
    setConnectionError("");
    try {
      const data = await api.restore();
      if (data.authRecovery) go("/restablecer");
      else accept(data);
    } catch (error) {
      if (error.status !== 401) setConnectionError(error.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    restore();
    return () => clearTimeout(toastTimer.current);
  }, []);
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
    document.title = `Entrenarme · ${navItems.find((n) => route.startsWith(n.path))?.name || "Tu entrenamiento"}`;
    document.querySelector("main")?.focus({ preventScroll: true });
    if (!loading && !connectionError && !profile && !isPublic) go("/login");
    if (!loading && profile && ["/login", "/registro"].includes(route))
      go("/inicio");
  }, [route, loading, profile, isPublic, connectionError]);
  useEffect(() => {
    let active = true;
    setResult(null);
    setResultError("");
    if (profile && route.startsWith("/resultados/"))
      api
        .session(route.split("/")[2])
        .then((data) => {
          if (active) {
            if (data.status === "completed") setResult(data);
            else setResultError("Esta actividad aún no tiene resultados.");
          }
        })
        .catch((error) => {
          if (active) setResultError(error.message);
        });
    return () => {
      active = false;
    };
  }, [route, profile?.id]);
  const run = async (action) => {
    if (busyRef.current) return null;
    busyRef.current = true;
    setBusy(true);
    try {
      return await action();
    } catch (error) {
      notify(error.message);
      if (error.code === "UNAUTHENTICATED") {
        setSaved(null);
        setSession(null);
        setResult(null);
        go("/login");
      }
      return null;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  const authenticate = async (signup, data) => {
    const next = await api.authenticate(signup, data);
    if (next.confirmationRequired) return next;
    accept(next);
    go("/inicio");
    return next;
  };
  const updateProfile = (data) =>
    run(async () => {
      await api.profile(data);
      accept(await api.bootstrap());
      notify("Los cambios se guardaron en tu cuenta.");
      return true;
    });
  const toggleMark = (id) =>
    run(async () => {
      await api.mark(id, !marked.includes(id));
      const data = await api.bootstrap();
      setSaved(data);
    });
  const startSession = (
    mode,
    selected = [],
    mission = null,
    topics = [],
    count = 20,
    fine = {},
  ) =>
    run(async () => {
      const activity = await api.start({
        mode,
        areas: selected,
        mission,
        topics,
        count,
        ...fine,
      });
      setSession(activity);
      setModal(null);
      go("/actividad");
      setSaved(await api.bootstrap());
    });
  const patchSession = (patch) =>
    run(async () => {
      const activity = await api.patchSession(session.id, patch);
      setSession(activity);
    });
  const finishActivity = async (id) => {
    const data = await api.finish(id);
    setResult(data);
    accept(await api.bootstrap());
    setModal(null);
    go(`/resultados/${id}`);
  };
  const finishSession = () => run(() => finishActivity(session.id));
  const reveal = (id) =>
    run(async () => setSession(await api.reveal(session.id, id)));
  const rate = (id, rating) =>
    run(async () => {
      const data = await api.rate(session.id, id, rating);
      setSession(data);
      // Completion is an explicit action, only when the server allows it.
    });
  const logout = () =>
    run(async () => {
      await api.logout();
      setSaved(null);
      setSession(null);
      setResult(null);
      setModal(null);
      go("/login");
    });
  const abandon = () =>
    run(async () => {
      await api.pause(session.id);
      const next = modal.next || "/quizzes";
      accept(await api.bootstrap());
      setModal(null);
      go(next);
    });
  const refreshSession = () =>
    run(async () => setSession(await api.session(session.id)));
  const resumeSession = (id = session?.id) =>
    run(async () => {
      setSession(await api.resume(id));
      setModal(null);
      go("/actividad");
    });
  const openHistory = (item) =>
    run(async () => {
      const activity = await api.session(item.id);
      if (activity.status === "completed") go(`/resultados/${item.id}`);
      else {
        setSession(activity);
        go("/actividad");
      }
    });
  const startMission = () =>
    run(async () => {
      const activity = await api.startMission();
      if (activity.rest) {
        setModal(null);
        go("/enarmapa");
        setSaved(await api.bootstrap());
        return;
      }
      setSession(activity);
      setSaved(await api.bootstrap());
      setModal(null);
      go("/actividad");
    });
  const completeRest = () =>
    run(async () => {
      await api.completeRest();
      accept(await api.bootstrap());
      notify("Descanso completado. Tu ruta está actualizada.");
    });
  const navigate = (path) => {
    if (busyRef.current) return;
    if (route === "/actividad" && session)
      setModal({ type: "exit", next: path });
    else go(path);
  };
  const activeNav =
    route.startsWith("/quizzes") ||
    ["/actividad", "/marcadas"].includes(route) ||
    route.startsWith("/resultados")
      ? "/quizzes"
      : route.startsWith("/perfil") ||
          ["/planes", "/configuracion", "/ayuda"].includes(route)
        ? "/perfil"
        : route;
  let content;
  if (loading)
    content = (
      <EmptyState
        title="Conectando con tu espacio"
        text="Estamos recuperando tu sesión."
      />
    );
  else if (connectionError)
    content = (
      <>
        <EmptyState
          title="No pudimos conectar"
          text={connectionError}
          action="Reintentar"
          onClick={restore}
        />
        <Button
          secondary
          onClick={async () => {
            await api.logout();
            setConnectionError("");
            setSaved(null);
            go("/login");
          }}
        >
          Volver al acceso
        </Button>
      </>
    );
  else if (route === "/bienvenida") content = <Landing go={go} />;
  else if (isPublic)
    content = (
      <Auth key={route} route={route} go={go} authenticate={authenticate} />
    );
  else if (!profile)
    content = <EmptyState title="Inicia sesión para continuar" />;
  else if (route === "/inicio")
    content = (
      <Dashboard
        profile={profile}
        history={history}
        completed={completed}
        go={go}
        openModal={setModal}
        stats={saved.stats}
        roadmap={saved.roadmap}
        activeSession={session}
      />
    );
  else if (route === "/quizzes") content = <QuizHub go={go} />;
  else if (route === "/quizzes/historial")
    content = (
      <HistoryPage
        history={history}
        pagination={saved.historyPagination}
        open={openHistory}
        go={go}
      />
    );
  else if (route.startsWith("/quizzes/"))
    content = (
      <QuizSetup
        key={route}
        mode={route.split("/")[2]}
        marked={marked}
        start={startSession}
        go={go}
        catalog={saved.catalog}
      />
    );
  else if (route === "/actividad")
    content = session ? (
      <QuizRunner
        session={session}
        patchSession={patchSession}
        reveal={reveal}
        rate={rate}
        busy={busy}
        marked={marked}
        toggleMark={toggleMark}
        finish={finishSession}
        refresh={refreshSession}
        resume={resumeSession}
        openModal={setModal}
      />
    ) : (
      <EmptyState
        title="Tu siguiente reto te espera"
        text="Elige una actividad para comenzar."
        action="Explorar quizzes"
        onClick={() => go("/quizzes")}
      />
    );
  else if (route.startsWith("/resultados/"))
    content = result ? (
      <Results
        key={result.id}
        result={result}
        go={go}
        marked={marked}
        toggleMark={toggleMark}
      />
    ) : (
      <EmptyState
        title={
          resultError
            ? "No pudimos abrir el resultado"
            : "Cargando tu resultado"
        }
        text={resultError}
        action={resultError ? "Ver historial" : undefined}
        onClick={() => go("/quizzes/historial")}
      />
    );
  else if (route === "/enarmapa")
    content = (
      <Roadmap
        roadmap={saved.roadmap}
        openModal={setModal}
        completeRest={completeRest}
      />
    );
  else if (route === "/estadisticas")
    content = (
      <Stats
        initialStats={saved.stats}
        premium={profile.planId === "premium"}
      />
    );
  else if (route === "/perfil")
    content = (
      <Profile profile={profile} marked={marked} go={go} openModal={setModal} />
    );
  else if (route === "/planes") content = <Plans profile={profile} />;
  else if (route === "/configuracion")
    content = (
      <SettingsPage
        profile={profile}
        saved={saved}
        updateProfile={updateProfile}
        go={go}
      />
    );
  else if (route === "/ayuda") content = <Help go={go} />;
  else if (route === "/marcadas")
    content = (
      <Marked list={saved.markedQuestions} toggleMark={toggleMark} go={go} />
    );
  else
    content = (
      <EmptyState
        title="Tomemos otra ruta"
        action="Volver al inicio"
        onClick={() => go("/inicio")}
      />
    );
  const shell = !loading && !connectionError && !isPublic && profile;
  return (
    <BusyContext.Provider value={busy}>
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
      {shell ? (
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
              <button
                className="sidebar-help"
                onClick={() => navigate("/ayuda")}
              >
                <CircleHelp size={18} /> ¿Necesitas una mano?
              </button>
              <button
                className="sidebar-profile"
                onClick={() => navigate("/perfil")}
              >
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
                <Tag color="purple">{profile.plan}</Tag>
                <button
                  className="notification-button icon-button"
                  onClick={() => setModal({ type: "notifications" })}
                  aria-label="Ver novedades"
                >
                  <Bell size={20} />
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
              aria-busy={busy}
              className={`main-content ${route === "/actividad" ? "runner-main" : ""}`}
            >
              {content}
              <footer className="app-footer">
                <span>Hecho para tu próxima gran meta.</span>
                <span>
                  <i />{" "}
                  {saved.catalog.hasSamples
                    ? "Banco de prueba"
                    : "Tu progreso se guarda en tu cuenta"}
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
      ) : (
        content
      )}
      <div
        className={`toast ${toast ? "show" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast && (
          <>
            <CircleHelp size={19} />
            {toast}
          </>
        )}
      </div>
      {modal && shell && (
        <Modal
          title={
            modal.title ||
            {
              notifications: "Tu centro de novedades",
              mission: "Tu misión del día",
              locked: "Cada paso abre un nuevo camino",
              exit: "¿Salir del entrenamiento?",
              finish: "¿Terminamos por hoy?",
              questionMap: "Mapa de preguntas",
              logout: "¿Cerrar tu sesión?",
              score: "Tu promedio, paso a paso",
              achievement: "¡Vas construyendo tu camino!",
            }[modal.type] ||
            "Un poco más de detalle"
          }
          close={() => !busy && setModal(null)}
        >
          {modal.type === "notifications" && (
            <div className="notice-list">
              <div>
                <span className="icon-tile cyan">
                  <Map />
                </span>
                <div>
                  <strong>Tu ruta está lista</strong>
                  <p>
                    {completed.length} misiones completadas en la semana actual.
                  </p>
                  <button
                    className="text-link"
                    onClick={() => {
                      setModal(null);
                      navigate("/enarmapa");
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
              <Tag color="cyan">SEMANA {saved.roadmap.currentWeek}</Tag>
              <h3 className="modal-big-title">
                {saved.roadmap.currentMission?.missionLabel ||
                  "Tu misión actual"}
              </h3>
              <p>
                {saved.roadmap.currentMission?.plannedRestDay
                  ? "Hoy toca revisar tu progreso y completar un descanso."
                  : "La ruta determina las preguntas y el próximo desbloqueo. Puedes pausar la misión y retomarla después."}
              </p>
              <Button className="full" onClick={startMission}>
                Abrir misión actual
              </Button>
            </>
          )}
          {modal.type === "locked" && (
            <>
              <p>
                {modal.message ||
                  "Esta misión todavía no está disponible. Consulta la fecha de desbloqueo en tu ruta."}
              </p>
              <Button onClick={() => setModal(null)}>Entendido</Button>
            </>
          )}
          {modal.type === "exit" && (
            <>
              <p>
                Tu avance se guarda en tu cuenta. Pausa la actividad para
                retomarla después.
              </p>
              <div className="modal-actions">
                <Button secondary onClick={() => setModal(null)}>
                  Continuar
                </Button>
                <Button onClick={abandon}>Pausar y salir</Button>
              </div>
            </>
          )}
          {modal.type === "finish" && (
            <>
              <p>
                Has completado {session?.completedItemCount} de {session?.total}{" "}
                reactivos. El servidor determinará el resultado de la sesión.
                Una misión requiere completar todos los reactivos.
              </p>
              <div className="modal-actions">
                <Button secondary onClick={() => setModal(null)}>
                  Continuar
                </Button>
                <Button disabled={!session?.canFinish} onClick={finishSession}>
                  Ver resultados
                </Button>
              </div>
            </>
          )}
          {modal.type === "questionMap" && (
            <>
              <p>
                Las respuestas siguen la secuencia indicada por el
                entrenamiento.
              </p>
              <div className="question-map">
                {session?.questions.map((q) => (
                  <span
                    key={q.id}
                    className={q.state === "completed" ? "answered" : ""}
                  >
                    {q.position}
                  </span>
                ))}
              </div>
            </>
          )}
          {modal.type === "logout" && (
            <>
              <p>Tu progreso seguirá guardado en tu cuenta.</p>
              <div className="modal-actions">
                <Button secondary onClick={() => setModal(null)}>
                  Volver
                </Button>
                <Button onClick={logout}>Cerrar sesión</Button>
              </div>
            </>
          )}
          {modal.type === "score" && (
            <>
              <span className="icon-tile cyan">
                <Target />
              </span>
              <p>
                Tu promedio actual usa hasta 280 respuestas y pondera la
                dificultad: baja 1, media 2 y alta 3. Los porcentajes se
                muestran en escala de 0 a 100. Las actividades de repaso sin
                calificación no modifican este promedio.
              </p>
              <p>
                Los resultados y las estadísticas se calculan en el servidor.
              </p>
            </>
          )}
          {modal.type === "achievement" && (
            <>
              <Mascot name="celebrate" className="celebration-mascot" />
              <h3>{completed.length} misiones completadas esta semana</h3>
              <p>
                Completa la misión actual y consulta tu ruta para conocer el
                próximo desbloqueo.
              </p>
              <Button
                onClick={() => {
                  setModal(null);
                  navigate("/enarmapa");
                }}
              >
                Continuar mi ruta
              </Button>
            </>
          )}
        </Modal>
      )}
    </BusyContext.Provider>
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
              <button className="explore-demo" onClick={() => go("/registro")}>
                Crear mi espacio <ArrowUpRight size={17} />
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
          Conoce Entrenarme <ArrowUpRight size={13} />
        </button>
      </footer>
    </div>
  );
}

function Auth({ route, go, authenticate }) {
  const signup = route === "/registro",
    recovery = route === "/recuperar",
    reset = route.startsWith("/restablecer");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [sent, setSent] = useState(false),
    [remember, setRemember] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmation: "",
    specialty: "",
  });
  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setError("");
    if ((reset || signup) && form.password !== form.confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      if (recovery) {
        await api.forgot(form.email);
        setSent(true);
      } else if (reset) {
        await api.reset({ password: form.password });
        setSent(true);
      } else {
        const result = await authenticate(signup, { ...form, remember });
        if (result?.confirmationRequired) setSent(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="auth-page">
      <header className="auth-header">
        <Logo onClick={() => go("/bienvenida")} />
        <button className="back-link" onClick={() => go("/bienvenida")}>
          <ArrowLeft size={17} /> Volver
        </button>
      </header>
      <main id="main-content" tabIndex={-1} className="auth-main">
        <section className="auth-card">
          <div className="eyebrow">
            {signup ? "TU SIGUIENTE CAPÍTULO" : "BIENVENIDO A TU ESPACIO"}
          </div>
          <h1>
            {signup
              ? "CREA TU CUENTA."
              : recovery
                ? "RECUPERA TU ACCESO."
                : reset
                  ? "UNA NUEVA CONTRASEÑA."
                  : "SIGAMOS CRECIENDO."}
          </h1>
          <p className="auth-description">
            {signup
              ? "Completa tus datos. Tu membresía y acceso se asignan en el servicio."
              : "Tu próxima gran conquista empieza con una sesión más."}
          </p>
          {sent ? (
            <div className="recovery-success">
              <Mail />
              <h2>{reset ? "Contraseña actualizada" : "Revisa tu correo"}</h2>
              <p>
                {reset
                  ? "Inicia sesión con tu nueva contraseña."
                  : signup
                    ? "Si el servicio requiere confirmación, abre el enlace recibido en este navegador. Tu perfil también debe estar habilitado para entrenar."
                    : "Si tu cuenta admite recuperación, recibirás un enlace. Ábrelo en este mismo navegador para continuar."}
              </p>
              <Button onClick={() => go("/login")}>Volver al acceso</Button>
            </div>
          ) : (
            <form onSubmit={submit} aria-busy={busy}>
              {signup && (
                <Field
                  label="Nombre visible"
                  name="name"
                  value={form.name}
                  onChange={change}
                  maxLength={100}
                  required
                  autoComplete="name"
                />
              )}
              {!reset && (
                <Field
                  label="Correo electrónico"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={change}
                  required
                  autoComplete="email"
                  placeholder="tu@correo.com"
                />
              )}
              {!recovery && (
                <Password
                  name="password"
                  label={signup || reset ? "Crea una contraseña" : "Contraseña"}
                  value={form.password}
                  onChange={change}
                  required
                  minLength={signup || reset ? 10 : 1}
                  maxLength={128}
                  autoComplete={
                    signup || reset ? "new-password" : "current-password"
                  }
                />
              )}
              {(signup || reset) && (
                <Password
                  name="confirmation"
                  label="Confirma tu contraseña"
                  value={form.confirmation}
                  onChange={change}
                  required
                  minLength={10}
                  maxLength={128}
                  autoComplete="new-password"
                />
              )}
              {signup && (
                <Field
                  label="Especialidad objetivo (opcional)"
                  name="specialty"
                  value={form.specialty}
                  onChange={change}
                  maxLength={100}
                  placeholder="La especialidad que te inspira"
                />
              )}
              {!signup && !recovery && !reset && (
                <div className="form-extras">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                    />{" "}
                    Recordarme
                  </label>
                  <button type="button" onClick={() => go("/recuperar")}>
                    Olvidé mi contraseña
                  </button>
                </div>
              )}
              {error && (
                <p className="error auth-error" role="alert">
                  {error}
                </p>
              )}
              <Button className="full" type="submit" disabled={busy}>
                {busy
                  ? "Un momento…"
                  : signup
                    ? "Crear cuenta"
                    : recovery
                      ? "Enviar enlace"
                      : reset
                        ? "Guardar contraseña"
                        : "Iniciar sesión"}
              </Button>
            </form>
          )}
          {!recovery && !reset && (
            <div className="auth-alternative">
              {signup ? "¿Ya tienes cuenta?" : "¿Es tu primera vez?"}{" "}
              <button
                disabled={busy}
                onClick={() => go(signup ? "/login" : "/registro")}
              >
                {signup ? "Iniciar sesión" : "Crea tu cuenta"}
              </button>
            </div>
          )}
          <p className="auth-disclaimer">
            <ShieldCheck size={15} /> Tu cuenta y tu progreso pertenecen al
            servicio de entrenamiento.
          </p>
        </section>
        <aside className="auth-visual">
          <div className="auth-glow" />
          <div className="auth-art-label">
            <Sparkles size={16} /> UN ALIADO EN CADA PASO
          </div>
          <Mascot name="doctor" />
          <div className="mascot-platform" />
          <blockquote>
            El conocimiento se construye.
            <br />
            <strong>La confianza también.</strong>
          </blockquote>
        </aside>
      </main>
      <footer className="auth-footer">Cada pequeño paso cuenta.</footer>
    </div>
  );
}

function Dashboard({
  profile,
  completed,
  go,
  openModal,
  stats,
  activeSession,
  roadmap,
}) {
  const mission = roadmap.currentMission;
  return (
    <>
      <PageTitle
        eyebrow="TU CONSTANCIA TE TRAJO HASTA AQUÍ"
        title={
          <>
            ¡Vamos con todo,{" "}
            <span className="text-cyan">{profile.name.split(" ")[0]}!</span>
          </>
        }
        subtitle="Hoy es un buen día para acercarte a tu residencia."
        action={
          <Tag color="purple">
            <Crown size={13} /> Plan {profile.plan}
          </Tag>
        }
      />
      {activeSession && (
        <div className="panel resume-banner">
          <div>
            <strong>Tienes un entrenamiento pendiente</strong>
            <p>
              {activeSession.title} · {activeSession.total} reactivos
            </p>
          </div>
          <Button onClick={() => go("/actividad")}>
            Continuar entrenamiento
          </Button>
        </div>
      )}
      <div className="dashboard-grid">
        <section className="mission-card">
          <div className="mission-copy">
            <Tag color="lime">TU MISIÓN DE HOY</Tag>
            <h2>
              Tu meta está
              <br />
              <span>un reto más cerca.</span>
            </h2>
            <p>{mission?.missionLabel || "Consulta tu siguiente paso"}</p>
            <div className="mission-meta">
              <span>
                <BookOpen size={14} />{" "}
                {mission?.questionCount
                  ? `${mission.questionCount} reactivos planeados`
                  : "Tu ruta personal"}
              </span>
            </div>
            <Button onClick={() => go("/enarmapa")}>Ver mi misión</Button>
            <span className="mission-footnote">
              {roadmap.canAdvanceToday
                ? "Tu siguiente paso está disponible."
                : "Consulta tu ruta para conocer el próximo desbloqueo."}
            </span>
          </div>
          <div className="mission-art">
            <div />
            <Mascot name="welcome" />
            <span className="mission-star">✦</span>
          </div>
        </section>
        <section className="panel">
          <Tag color="cyan">SEMANA {roadmap.currentWeek}</Tag>
          <h2>Un paso a la vez</h2>
          <p>
            {completed.length} de {(roadmap.nodes || []).length} misiones
            completadas esta semana.
          </p>
          <Progress
            value={
              roadmap.nodes?.length
                ? (completed.length / roadmap.nodes.length) * 100
                : 0
            }
          />
          <Button secondary onClick={() => go("/enarmapa")}>
            Abrir ENARMapa
          </Button>
        </section>
      </div>
      <div className="metric-grid">
        <div className="metric-card">
          <span className="icon-tile cyan">
            <Target />
          </span>
          <div>
            <span>
              Promedio ponderado actual{" "}
              <button
                aria-label="Cómo se calcula mi promedio"
                onClick={() => openModal({ type: "score" })}
              >
                <CircleHelp size={13} />
              </button>
            </span>
            <strong>
              {stats.recentAverage === null
                ? "—"
                : stats.recentAverage.toFixed(1)}
              <small> / 100</small>
            </strong>
          </div>
        </div>
        <div className="metric-card">
          <span className="icon-tile purple">
            <CheckCheck />
          </span>
          <div>
            <span>Respuestas registradas</span>
            <strong>{stats.total}</strong>
          </div>
        </div>
        <div className="metric-card">
          <span className="icon-tile lime">
            <BookOpen />
          </span>
          <div>
            <span>Preguntas distintas</span>
            <strong>{stats.unique}</strong>
          </div>
        </div>
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
  const activity = activities.find((a) => a.id === mode),
    custom = mode === "personalizado",
    cards = mode === "flashcards";
  const [count, setCount] = useState(20),
    [selected, setSelected] = useState([]),
    [options, setOptions] = useState({ specialties: [], topics: [], tags: [] }),
    [fine, setFine] = useState({ specialties: [], topics: [], tags: [] }),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setFine({ specialties: [], topics: [], tags: [] });
    setOptions({ specialties: [], topics: [], tags: [] });
    setError("");
    if (custom && selected.length) {
      setLoading(true);
      api
        .filterOptions(selected)
        .then((data) => {
          if (active) setOptions(data);
        })
        .catch((e) => {
          if (active) setError(e.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    } else setLoading(false);
    return () => {
      active = false;
    };
  }, [selected.join("|"), custom]);
  if (!activity)
    return (
      <EmptyState
        title="Elige una actividad"
        action="Ver quizzes"
        onClick={() => go("/quizzes")}
      />
    );
  const totalFine = Object.values(fine).flat().length;
  return (
    <>
      <button className="back-link" onClick={() => go("/quizzes")}>
        <ArrowLeft size={17} /> Todos los quizzes
      </button>
      <PageTitle
        eyebrow="PREPARA TU ENTRENAMIENTO"
        title={activity.title}
        subtitle={activity.detail}
      />
      <div className="setup-layout">
        <section className="panel setup-form">
          <h2>¿Cuánto quieres practicar?</h2>
          <div className="count-options">
            {(cards ? [10, 20, 50] : [10, 20, 50, 100]).map((n) => (
              <button
                key={n}
                aria-pressed={count === n}
                className={count === n ? "selected" : ""}
                onClick={() => setCount(n)}
              >
                <strong>{n}</strong>
                <span>{cards ? "tarjetas" : "preguntas"}</span>
              </button>
            ))}
          </div>
          {custom && (
            <>
              <div className="setup-section">
                <h2>Elige tus áreas</h2>
                <div className="area-picker">
                  {areas.map((a) => (
                    <button
                      key={a.name}
                      aria-pressed={selected.includes(a.name)}
                      className={selected.includes(a.name) ? "selected" : ""}
                      onClick={() =>
                        setSelected((old) =>
                          old.includes(a.name)
                            ? old.filter((x) => x !== a.name)
                            : [...old, a.name],
                        )
                      }
                    >
                      <Icon name={a.icon} />
                      {a.short}
                    </button>
                  ))}
                </div>
              </div>
              <div className="setup-section">
                <h2>Afina tu selección</h2>
                <p className="muted">
                  Hasta cinco especialidades, temas y etiquetas combinados. Se
                  incluirán preguntas que coincidan con cualquiera de esos
                  filtros dentro de las áreas elegidas.
                </p>
                {loading && <p role="status">Cargando filtros…</p>}
                {error && (
                  <p className="error" role="alert">
                    {error}
                  </p>
                )}
                {Object.entries({
                  specialties: "Especialidades",
                  topics: "Temas",
                  tags: "Etiquetas",
                }).map(([key, label]) => (
                  <label className="field" key={key}>
                    <span>{label}</span>
                    <select
                      multiple
                      size={Math.min(5, Math.max(2, options[key].length))}
                      value={fine[key]}
                      disabled={loading || !selected.length}
                      onChange={(e) => {
                        const values = Array.from(
                          e.target.selectedOptions,
                          (o) => o.value,
                        );
                        if (totalFine - fine[key].length + values.length > 5) {
                          setError(
                            "Selecciona como máximo cinco filtros finos.",
                          );
                          return;
                        }
                        setError("");
                        setFine({ ...fine, [key]: values });
                      }}
                    >
                      {options[key].map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
                {options.truncated && (
                  <p className="muted">
                    El catálogo alcanzó su límite. Reduce las áreas para acotar
                    la selección.
                  </p>
                )}
              </div>
            </>
          )}
          {!custom && (
            <div className="setup-distribution">
              <h3>
                {cards
                  ? "Tus preguntas marcadas"
                  : mode === "inteligente"
                    ? "Responder, comprender y valorar"
                    : "Un nuevo entrenamiento"}
              </h3>
              <p>
                {cards
                  ? `Tienes ${marked.length} marcas. Revela cada tarjeta antes de valorar su dificultad.`
                  : mode === "inteligente"
                    ? "Responde cada pregunta y valora su dificultad después de revisar la explicación. Este repaso no modifica tu promedio."
                    : "Confirma cada respuesta para continuar. El orden y el avance se guardan en tu cuenta."}
              </p>
            </div>
          )}
        </section>
        <aside className="setup-summary panel">
          <span className={`activity-icon ${activity.color}`}>
            <Icon name={activity.icon} size={28} />
          </span>
          <h2>Tu próximo reto</h2>
          <div className="summary-row">
            <span>Actividad</span>
            <strong>{activity.title}</strong>
          </div>
          <div className="summary-row">
            <span>Reactivos</span>
            <strong>{count}</strong>
          </div>
          <p className="muted">
            La disponibilidad de preguntas y los permisos de tu plan se
            comprueban al iniciar.
          </p>
          <Button
            className="full"
            disabled={
              loading ||
              (custom && !selected.length) ||
              (cards && !marked.length)
            }
            onClick={() =>
              start(mode, selected, null, fine.topics, count, {
                specialties: fine.specialties,
                tags: fine.tags,
              })
            }
          >
            Comenzar {cards ? "repaso" : "quiz"}
          </Button>
        </aside>
      </div>
    </>
  );
}

function QuizRunner({
  session,
  patchSession,
  reveal,
  rate,
  busy,
  marked,
  toggleMark,
  finish,
  refresh,
  resume,
  openModal,
}) {
  const q =
    session.current === null ? null : session.questions[session.current];
  const [draft, setDraft] = useState(null);
  useEffect(() => setDraft(null), [q?.id]);
  const cards = session.isCards,
    showAnswer = q?.answer !== undefined;
  if (session.status === "paused")
    return (
      <EmptyState
        title="Entrenamiento en pausa"
        text="Tu avance está guardado. Reanuda para continuar."
        action="Reanudar entrenamiento"
        onClick={() => resume(session.id)}
      />
    );
  return (
    <div className="quiz-runner">
      <div className="runner-top">
        <button
          className="back-link"
          onClick={() => openModal({ type: "exit", next: "/quizzes" })}
        >
          <X size={18} /> Pausar
        </button>
        <span>{session.title}</span>
        <button className="text-link" disabled={busy} onClick={refresh}>
          Actualizar estado
        </button>
      </div>
      <div className="runner-progress-label">
        <span>
          {q
            ? `${cards ? "Tarjeta" : "Pregunta"} ${q.position} de ${session.total}`
            : "Reactivos completados"}
        </span>
        <span>{session.completedItemCount} completados</span>
      </div>
      <Progress
        value={
          session.total ? (session.completedItemCount / session.total) * 100 : 0
        }
      />
      {q && (
        <>
          <div className="question-meta">
            <Tag color="cyan">{cards ? "FLASHCARD" : "ENTRENAMIENTO"}</Tag>
            <button
              className={`mark-button ${marked.includes(q.globalKey) ? "marked" : ""}`}
              disabled={busy || !q.globalKey}
              onClick={() => toggleMark(q.globalKey)}
              aria-pressed={marked.includes(q.globalKey)}
            >
              <Bookmark size={17} />
              {marked.includes(q.globalKey) ? "Marcada" : "Marcar"}
            </button>
          </div>
          <section className={`question-panel ${cards ? "flashcard" : ""}`}>
            {q.caseText && (
              <div className="clinical-case">
                <span className="eyebrow">CASO CLÍNICO</span>
                <p>{q.caseText}</p>
              </div>
            )}
            <h1>{q.text}</h1>
            {!cards && (
              <div className="answer-options">
                {q.options.map((option, i) => (
                  <button
                    key={i}
                    disabled={
                      busy ||
                      session.answers[q.id] !== undefined ||
                      session.nextAction !== "answer_question"
                    }
                    onClick={() => setDraft(i)}
                    aria-pressed={(session.answers[q.id] ?? draft) === i}
                    className={
                      (session.answers[q.id] ?? draft) === i ? "selected" : ""
                    }
                  >
                    <span className="answer-letter">{"ABCD"[i]}</span>
                    <span>{option}</span>
                  </button>
                ))}
              </div>
            )}
            {showAnswer && (
              <div className="flash-answer">
                <Tag color="lime">
                  {q.isCorrect === false ? "PARA REFORZAR" : "RESPUESTA"}
                </Tag>
                <h2>{q.options[q.answer]}</h2>
                {q.explanation && <p>{q.explanation}</p>}
              </div>
            )}
            {cards && !showAnswer && (
              <button
                className="reveal-button"
                disabled={busy}
                onClick={() => reveal(q.id)}
              >
                <RotateCcw size={24} />
                <span>Revelar respuesta</span>
              </button>
            )}
          </section>
          {session.nextAction === "answer_question" && !cards && (
            <Button
              className="full"
              disabled={busy || draft === null}
              onClick={() => patchSession({ answers: { [q.id]: draft } })}
            >
              Confirmar respuesta
            </Button>
          )}
          {(session.nextAction === "rate_question" ||
            (cards &&
              showAnswer &&
              session.nextAction === "review_flashcard")) && (
            <div className="flash-rating">
              <p>¿Qué dificultad tuvo esta pregunta?</p>
              <div>
                {[
                  { name: "Difícil", color: "pink" },
                  { name: "Regular", color: "purple" },
                  { name: "Fácil", color: "lime" },
                ].map((r) => (
                  <button
                    key={r.name}
                    className={r.color}
                    disabled={busy || session.ratedIds.includes(q.id)}
                    onClick={() => rate(q.id, r.name)}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {session.canFinish && (
        <Button secondary onClick={() => openModal({ type: "finish" })}>
          Finalizar y ver resultado
        </Button>
      )}
      {session.finishBlockedReason && (
        <p className="muted">
          {session.finishBlockedReason === "pending_question_rating"
            ? "Valora la pregunta pendiente para continuar."
            : session.finishBlockedReason ===
                "enarmapa_requires_full_completion"
              ? "Completa todos los reactivos para terminar esta misión."
              : "Continúa con el siguiente paso del entrenamiento."}
        </p>
      )}
      <div className="runner-note">
        <ShieldCheck size={14} /> Confirma cada respuesta para guardarla. Ante
        una desconexión, actualiza el estado antes de repetir.
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
                    className={`mark-button ${marked.includes(q.globalKey) ? "marked" : ""}`}
                    onClick={() => toggleMark(q.globalKey)}
                    aria-pressed={marked.includes(q.globalKey)}
                  >
                    <Bookmark size={16} />
                    {marked.includes(q.globalKey) ? "Marcada" : "Marcar"}
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
                  <Check size={17} />{" "}
                  {q.options[q.answer] || "Respuesta no disponible"}
                </p>
                <div className="explanation">
                  <Lightbulb size={18} />
                  <p>
                    {q.explanation ||
                      "El servicio no proporcionó una explicación."}
                  </p>
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
                {result.score ?? "—"}
                <small>%</small>
              </strong>
              <span>Resultado ponderado</span>
            </div>
            <div>
              <strong>
                {result.correct ?? "—"}
                <small>/{result.total}</small>
              </strong>
              <span>Respuestas correctas</span>
            </div>
            <div>
              <strong className="text-pink">
                {result.result?.answeredCount === null
                  ? "—"
                  : Math.max(0, result.total - (result.correct ?? 0))}
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

function Roadmap({ roadmap, openModal, completeRest }) {
  const labels = {
    completed: "Completada",
    in_progress: "En curso",
    available: "Disponible",
    locked_until_tomorrow: "Próximo desbloqueo",
    locked: "Bloqueada",
  };
  const nodes = roadmap.nodes || [];
  return (
    <>
      <PageTitle
        eyebrow="TU GRAN META SE CONSTRUYE DÍA A DÍA"
        title={
          <>
            Este es <span className="text-cyan">tu camino.</span>
          </>
        }
        subtitle={`Semana ${roadmap.currentWeek} · Fecha de estudio ${roadmap.today}`}
      />
      <div className="roadmap-layout">
        <section className="map-panel">
          <div className="map-banner">
            <span className="icon-tile cyan">
              <Map />
            </span>
            <div>
              <span className="eyebrow">SEMANA {roadmap.currentWeek}</span>
              <h2>Tu ruta de entrenamiento</h2>
            </div>
          </div>
          <div className="roadmap-track">
            {nodes.map((node, i) => {
              const done = node.status === "completed",
                active = ["available", "in_progress"].includes(node.status);
              return (
                <div
                  key={node.mapDay}
                  className={`roadmap-stop ${i % 2 ? "right" : "left"} ${done ? "done" : active ? "current" : "locked"}`}
                >
                  <button
                    className="map-node"
                    disabled={!active}
                    aria-label={`Día ${node.mapDay}: ${node.missionLabel}, ${labels[node.status]}`}
                    onClick={() => openModal({ type: "mission" })}
                  >
                    {done ? (
                      <Check size={29} />
                    ) : active ? (
                      <Zap size={30} />
                    ) : (
                      <LockKeyhole size={22} />
                    )}
                  </button>
                  <div className="map-stop-label">
                    <span>
                      DÍA {node.mapDay} · {labels[node.status]}
                    </span>
                    <strong>{node.missionLabel}</strong>
                    {node.execution?.fallbackUsed && (
                      <small>
                        Actividad ajustada:{" "}
                        {node.execution.fallbackReason ||
                          "según disponibilidad"}
                      </small>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <aside className="map-aside">
          <section className="panel week-summary">
            <Tag color="lime">TU AVANCE</Tag>
            <h2>
              {nodes.filter((n) => n.status === "completed").length} de{" "}
              {nodes.length} misiones
            </h2>
            <p>
              {roadmap.canAdvanceToday
                ? "Continúa con la misión actual."
                : "La ruta determina cuándo podrás avanzar de nuevo."}
            </p>
            <Button
              className="full"
              disabled={
                !roadmap.currentMission ||
                (!roadmap.canAdvanceToday &&
                  roadmap.currentMission.status !== "in_progress")
              }
              onClick={() => openModal({ type: "mission" })}
            >
              Abrir misión actual
            </Button>
            {roadmap.currentMission?.plannedRestDay && (
              <>
                <p>Revisa tus estadísticas antes de completar el descanso.</p>
                <RestMission complete={completeRest} />
              </>
            )}
          </section>
          <div className="map-mascot">
            <Mascot name="doctor" />
          </div>
        </aside>
      </div>
    </>
  );
}
function RestMission({ complete }) {
  const [viewed, setViewed] = useState(false),
    [summary, setSummary] = useState(null),
    [error, setError] = useState("");
  return (
    <>
      <Button
        secondary
        onClick={async () => {
          try {
            setSummary(await api.stats());
            setViewed(true);
            setError("");
          } catch (e) {
            setError(e.message);
          }
        }}
      >
        Revisar mi progreso
      </Button>
      {summary && (
        <p>
          Promedio ponderado: {summary.average ?? "—"} / 100 · {summary.total}{" "}
          respuestas
        </p>
      )}
      {error && <p className="error">{error}</p>}
      <Button disabled={!viewed} onClick={complete}>
        Completar descanso
      </Button>
    </>
  );
}

function Stats({ initialStats, premium }) {
  const [stats, setStats] = useState(initialStats),
    [analysis, setAnalysis] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  const advanced = async () => {
    setLoading(true);
    setError("");
    try {
      setAnalysis(await api.analysis());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <PageTitle
        eyebrow="EL PROGRESO TAMBIÉN SE PUEDE VER"
        title="Tu esfuerzo, en perspectiva."
        subtitle="Promedios ponderados y porcentajes de acierto son métricas distintas."
      />
      <div className="metric-grid">
        {[
          {
            label: "Promedio ponderado actual",
            value: stats.recentAverage,
            unit: "/ 100",
          },
          {
            label: "Promedio ponderado histórico",
            value: stats.average,
            unit: "/ 100",
          },
          { label: "Respuestas registradas", value: stats.total, unit: "" },
        ].map((item) => (
          <div className="metric-card" key={item.label}>
            <div>
              <span>{item.label}</span>
              <strong>
                {item.value === null
                  ? "—"
                  : typeof item.value === "number"
                    ? Number(item.value.toFixed(1))
                    : item.value}
                <small> {item.unit}</small>
              </strong>
            </div>
          </div>
        ))}
      </div>
      <section className="panel">
        <h2>Evolución por semana</h2>
        <div className="api-weekly-list">
          {stats.weekly.map((week, i) => (
            <div className="summary-row" key={`${week.week}-${i}`}>
              <span>
                Semana {week.week}
                <small>
                  {" "}
                  {week.startDate} — {week.closeDate}
                </small>
              </span>
              <strong>
                {week.average === null
                  ? "—"
                  : `${Number(week.average.toFixed(1))}%`}{" "}
                <small>· {week.answered} respuestas</small>
              </strong>
            </div>
          ))}
        </div>
        {!stats.weekly.length && (
          <p className="muted">Tu historial de entrenamiento aparecerá aquí.</p>
        )}
      </section>
      <div className="stats-summary-grid">
        <section className="panel">
          <h2>Aciertos por área</h2>
          <div className="area-stats-list">
            {stats.areaStats.map((area) => (
              <div className="real-area-stat" key={area.name}>
                <div>
                  <strong>{area.name}</strong>
                  <span>
                    {area.score === null
                      ? "Sin respuestas"
                      : `${Number(area.score.toFixed(1))}%`}
                  </span>
                </div>
                <Progress value={area.score || 0} />
                <small>
                  {area.correct} aciertos de {area.total} respuestas
                </small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <h2>Tu recorrido por el banco</h2>
          <p>
            {stats.unique} preguntas distintas · {stats.bankTotal ?? "—"}{" "}
            disponibles en la versión publicada.
          </p>
          {stats.exposure !== null && <Progress value={stats.exposure} />}
          <div className="modal-metrics">
            <div>
              <strong>{stats.correct}</strong>
              <span>Aciertos</span>
            </div>
            <div>
              <strong>{stats.incorrect}</strong>
              <span>Respuestas incorrectas</span>
            </div>
          </div>
          <p className="muted">
            Las actividades sin calificación no modifican el promedio.
          </p>
        </section>
      </div>
      <section className="panel">
        <h2>Análisis avanzado</h2>
        <p>
          {premium
            ? "Consulta tus prioridades y recuperación de errores."
            : "Disponible con una membresía Premium activa."}
        </p>
        <Button disabled={!premium || loading} onClick={advanced}>
          {loading ? "Consultando…" : "Consultar análisis"}
        </Button>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {analysis && (
          <>
            <h3>Prioridades de estudio</h3>
            {analysis.priorities.map((p, i) => (
              <div className="summary-row" key={i}>
                <span>
                  {p.area} · {p.specialty} · {p.topic}
                </span>
                <strong>{p.priority}</strong>
              </div>
            ))}
            <p>
              Preguntas con errores:{" "}
              {analysis.failureAnalysis.questionsWithErrors} · Recuperadas
              actualmente: {analysis.failureAnalysis.currentState.recovered}
            </p>
            {!analysis.priorities.length && (
              <p className="muted">Todavía no hay prioridades calculadas.</p>
            )}
          </>
        )}
      </section>
    </>
  );
}

function HistoryPage({ history, pagination, open, go }) {
  const [items, setItems] = useState(history),
    [page, setPage] = useState(pagination),
    [filter, setFilter] = useState("Todas"),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const more = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const next = await api.history({ offset: page.offset + page.limit });
      setItems((old) => [
        ...old,
        ...next.items.filter((item) => !old.some((x) => x.id === item.id)),
      ]);
      setPage(next.pagination);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  const filtered = items.filter(
    (h) =>
      filter === "Todas" ||
      (filter === "En curso"
        ? h.status !== "completed"
        : filter === "Quizzes"
          ? !h.isCards
          : h.isCards),
  );
  return (
    <>
      <button className="back-link" onClick={() => go("/quizzes")}>
        <ArrowLeft size={17} /> Todos los quizzes
      </button>
      <PageTitle
        eyebrow="CADA SESIÓN DEJA HUELLA"
        title="Tu historial de esfuerzo."
        subtitle="Retoma actividades pendientes o revisa tus resultados."
      />
      <div className="filter-tabs">
        {["Todas", "Quizzes", "Flashcards", "En curso"].map((f) => (
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
            onClick={() => open(h)}
          >
            <span className={`icon-tile ${h.isCards ? "cyan" : "purple"}`}>
              <Icon name={h.isCards ? "Layers" : "Zap"} />
            </span>
            <div>
              <h3>{h.title}</h3>
              <p>
                {h.date} · {h.total} reactivos
              </p>
            </div>
            <div className="history-score">
              <strong>
                {h.status !== "completed"
                  ? "Continuar"
                  : h.isCards
                    ? "Completado"
                    : h.score === null
                      ? "—"
                      : `${h.score}%`}
              </strong>
              <small>
                {h.status === "paused"
                  ? "En pausa"
                  : h.status === "completed"
                    ? "Ver resultado"
                    : "En curso"}
              </small>
            </div>
            <ChevronRight size={20} />
          </button>
        ))}
      </div>
      {!filtered.length && (
        <p className="muted">
          No hay actividades en este filtro dentro de las páginas cargadas.
        </p>
      )}
      {error && <p className="error">{error}</p>}
      {page?.hasMore && (
        <Button secondary disabled={loading} onClick={more}>
          {loading ? "Cargando…" : "Cargar más actividades"}
        </Button>
      )}
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
            <h3>{profile.specialty || "Especialidad por definir"}</h3>
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

function Plans({ profile }) {
  return (
    <>
      <PageTitle
        eyebrow="TU MEMBRESÍA"
        title="Tu espacio para avanzar."
        subtitle="Los permisos se determinan por tu membresía activa."
      />
      <div className="plans-grid">
        {["Básico", "Premium"].map((plan, i) => (
          <section
            className={`panel plan-card ${i ? "premium" : ""}`}
            key={plan}
          >
            <Icon name={i ? "Crown" : "Zap"} size={34} />
            <h2>{plan}</h2>
            <p>
              {i
                ? "Incluye acceso al análisis avanzado de desempeño."
                : "Tu acceso al entrenamiento depende de los permisos asignados a tu cuenta."}
            </p>
            <Tag color={profile.plan === plan ? "lime" : "purple"}>
              {profile.plan === plan
                ? "Tu plan actual"
                : "Contacta al responsable para conocer las opciones"}
            </Tag>
          </section>
        ))}
      </div>
      <p className="plans-note">
        <ShieldCheck size={16} /> La web no procesa pagos ni modifica tu
        membresía.
      </p>
    </>
  );
}

function SettingsPage({ profile, updateProfile, go }) {
  const [form, setForm] = useState({
    name: profile.name,
    specialty: profile.specialty,
  });
  return (
    <>
      <button className="back-link" onClick={() => go("/perfil")}>
        <ArrowLeft size={17} /> Mi perfil
      </button>
      <PageTitle
        title="A tu manera."
        subtitle="Edita el nombre y la especialidad objetivo de tu perfil."
      />
      <form
        className="settings-layout"
        onSubmit={(e) => {
          e.preventDefault();
          updateProfile(form);
        }}
      >
        <section className="panel">
          <h2>Tu información</h2>
          <Field
            label="Nombre visible"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            maxLength={100}
          />
          <Field
            label="Correo de tu cuenta"
            type="email"
            value={profile.email}
            readOnly
          />
          <Field
            label="Especialidad objetivo"
            value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })}
            maxLength={100}
            placeholder="La especialidad que te inspira"
          />
          <p className="muted">
            Deja el nombre o la especialidad en blanco para borrar ese dato del
            perfil.
          </p>
          <Button className="full" type="submit" icon="Check">
            Guardar cambios
          </Button>
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
              q: "¿Cómo funciona Entrenarme?",
              a: "Crea una cuenta, configura un quiz y entrena. Las respuestas, los marcadores y el avance se guardan en tu cuenta. Puedes retomar una actividad pendiente después de recargar o volver a iniciar sesión.",
            },
            {
              q: "¿Cómo se calcula mi promedio?",
              a: "Tu promedio actual usa hasta 280 respuestas y pondera la dificultad de las preguntas. Se expresa de 0 a 100 y es distinto del porcentaje de aciertos. Los repasos sin calificación no modifican ese promedio.",
            },
            {
              q: "¿Qué incluye mi membresía?",
              a: "Los permisos se comprueban al iniciar cada actividad. El análisis avanzado requiere Premium. Tu perfil muestra la membresía efectiva asignada a tu cuenta.",
            },
            {
              q: "¿Qué es ENARMapa?",
              a: "Es tu ruta de estudio con misiones y días de descanso. El servicio determina la actividad actual, la cantidad de preguntas y la fecha de desbloqueo del próximo paso.",
            },
            {
              q: "¿Dónde se guarda mi información?",
              a: "Tu cuenta, historial y avance se gestionan en el servicio de entrenamiento. Con Recordarme, tu sesión puede conservarse entre visitas; cierra sesión al terminar en una computadora compartida.",
            },
            {
              q: "¿Ya puedo usar las preguntas para estudiar?",
              a: "Los entrenamientos utilizan la versión del banco publicada por el responsable del servicio. Consulta con el equipo editorial la validación y las referencias del contenido.",
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
          <small>Versión 2.0 · Aplicación web</small>
        </aside>
      </div>
    </>
  );
}

function Marked({ list, toggleMark, go }) {
  return (
    <>
      <button className="back-link" onClick={() => go("/perfil")}>
        <ArrowLeft size={17} /> Mi perfil
      </button>
      <PageTitle
        eyebrow="TU COLECCIÓN"
        title="Ideas para el siguiente repaso."
        subtitle={`${list.length} preguntas marcadas.`}
        action={
          list.length > 0 && (
            <Button onClick={() => go("/quizzes/flashcards")}>
              Repasar flashcards
            </Button>
          )
        }
      />
      <div className="marked-list">
        {list.map((mark, i) => (
          <article className="panel" key={mark.globalKey}>
            <div className="section-heading">
              <h3>Pregunta marcada {i + 1}</h3>
              <button
                className="icon-button text-pink"
                aria-label={`Quitar marca ${i + 1}`}
                onClick={() => toggleMark(mark.globalKey)}
              >
                <Bookmark fill="currentColor" size={19} />
              </button>
            </div>
            <p className="muted">
              Guardada el {new Date(mark.markedAt).toLocaleDateString("es-MX")}.
              Abre un repaso de flashcards para consultar el contenido.
            </p>
          </article>
        ))}
      </div>
      {!list.length && (
        <EmptyState
          title="Tu colección empieza con una pregunta"
          text="Durante un entrenamiento, toca Marcar para guardar lo que quieras repasar."
          action="Ir a quizzes"
          onClick={() => go("/quizzes")}
        />
      )}
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

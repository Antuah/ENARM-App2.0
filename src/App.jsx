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
      accept(await api.restore());
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
    accept(await api.authenticate(signup, data));
    go("/inicio");
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
  ) =>
    run(async () => {
      const activity = await api.start({
        mode,
        areas: selected,
        mission,
        topics,
        count,
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
      if (data.ratedIds.length === data.total) await finishActivity(data.id);
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
      await api.abandon(session.id);
      const next = modal.next || "/quizzes";
      accept(await api.bootstrap());
      setModal(null);
      go(next);
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
      <EmptyState
        title="No pudimos conectar"
        text={connectionError}
        action="Reintentar"
        onClick={restore}
      />
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
        activeSession={session}
      />
    );
  else if (route === "/quizzes") content = <QuizHub go={go} />;
  else if (route === "/quizzes/historial")
    content = <HistoryPage history={history} go={go} />;
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
        completed={completed}
        streak={saved.stats.streak}
        openModal={setModal}
      />
    );
  else if (route === "/estadisticas")
    content = <Stats initialStats={saved.stats} notify={notify} />;
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
  const resource = saved?.resources;
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
                <button
                  className="token-pill"
                  onClick={() => setModal({ type: "tokens" })}
                >
                  <Zap size={16} fill="currentColor" />{" "}
                  {resource.unlimited
                    ? "∞"
                    : resource.dailyTokens + resource.bonusTokens}{" "}
                  <span>tokens</span>
                  <ChevronDown size={13} />
                </button>
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
              tokens: "Un impulso para entrenar",
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
          {modal.type === "tokens" && (
            <>
              <div className="token-large">
                <Zap />
                {resource.dailyTokens}
                <small>tokens diarios disponibles</small>
              </div>
              <p>
                Recibes 10 tokens cada día. Se consume un token por cada cinco
                preguntas o tarjetas, redondeando hacia arriba. Las misiones son
                gratuitas.
              </p>
              <div className="modal-metrics">
                <div>
                  <strong>{resource.bonusTokens}</strong>
                  <span>Tokens+ por misiones</span>
                </div>
              </div>
              <Button
                onClick={() => {
                  setModal(null);
                  navigate("/quizzes");
                }}
              >
                Vamos a entrenar
              </Button>
            </>
          )}
          {modal.type === "notifications" && (
            <div className="notice-list">
              <div>
                <span className="icon-tile cyan">
                  <Map />
                </span>
                <div>
                  <strong>Tu ruta está lista</strong>
                  <p>{completed.length} de 7 misiones completadas.</p>
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
              <Tag color="cyan">SEMANA 01 · DÍA {modal.day + 1}</Tag>
              <h3 className="modal-big-title">{missions[modal.day]}</h3>
              <p>
                Entrena con las preguntas disponibles para esta misión. Responde
                todas para completar el día y desbloquear el siguiente.
              </p>
              <div className="session-facts">
                <span>
                  <BookOpen size={17} /> Hasta 20 preguntas
                </span>
                <span>
                  <Zap size={17} /> Sin costo de tokens
                </span>
              </div>
              <Button
                className="full"
                onClick={() =>
                  startSession(
                    modal.day === 6 ? "inteligente" : "rapido",
                    [],
                    modal.day,
                  )
                }
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
                <strong>{missions[modal.day]}</strong>.
              </p>
              <Button className="full" onClick={() => setModal(null)}>
                Entendido
              </Button>
            </>
          )}
          {modal.type === "exit" && (
            <>
              <p>
                Puedes dejar esta actividad pendiente y retomarla después, o
                cerrarla sin calificar. Los tokens ya utilizados no se
                devuelven.
              </p>
              <div className="modal-actions">
                <Button secondary onClick={abandon}>
                  Cerrar actividad
                </Button>
                <Button
                  onClick={() => {
                    const next = modal.next || "/inicio";
                    setModal(null);
                    go(next);
                  }}
                >
                  Guardar y salir
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
                  {session?.total}
                </strong>{" "}
                preguntas. Las que queden sin responder cuentan como errores.
                Para completar una misión debes responder todas.
              </p>
              <div className="modal-actions">
                <Button secondary onClick={() => setModal(null)}>
                  Continuar
                </Button>
                <Button onClick={finishSession}>Ver resultados</Button>
              </div>
            </>
          )}
          {modal.type === "questionMap" && (
            <>
              <p>Salta a una pregunta para revisar tu respuesta.</p>
              <div className="question-map">
                {session?.questions.map((q, i) => (
                  <button
                    key={q.id}
                    disabled={busy}
                    className={
                      session.answers[q.id] !== undefined ? "answered" : ""
                    }
                    onClick={async () => {
                      await patchSession({ current: i });
                      setModal(null);
                    }}
                  >
                    {i + 1}
                  </button>
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
                Tu promedio actual usa las últimas 280 preguntas calificadas, o
                todas si aún no llegas a esa cantidad. Las tarjetas no modifican
                tu calificación.
              </p>
              <p>
                Los resultados y las estadísticas se calculan en el servidor.
              </p>
            </>
          )}
          {modal.type === "achievement" && (
            <>
              <Mascot name="celebrate" className="celebration-mascot" />
              <h3>{completed.length} de 7 misiones completadas</h3>
              <p>
                Termina cada misión para obtener Tokens+ y desbloquear el
                siguiente día.
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
  const signup = route === "/registro";
  const recovery = route === "/recuperar";
  const reset = route.startsWith("/restablecer");
  const token = reset
    ? new URLSearchParams(route.split("?")[1] || "").get("token")
    : null;
  const [step, setStep] = useState(0);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({
    name: "",
    lastname: "",
    email: "",
    password: "",
    confirmation: "",
    specialty: "Medicina Interna",
    target: "2027",
  });
  const change = (event) =>
    setForm((old) => ({ ...old, [event.target.name]: event.target.value }));
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (signup && step < 2) {
      setStep(step + 1);
      return;
    }
    if (reset && form.password !== form.confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setBusy(true);
    try {
      if (recovery) {
        await api.forgot(form.email);
        setSent(true);
      } else if (reset) {
        await api.reset({ token: token || "", password: form.password });
        setSent(true);
      } else {
        const { confirmation, ...registration } = form;
        await authenticate(
          signup,
          signup
            ? registration
            : { email: form.email, password: form.password, remember },
        );
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  };
  const titles = signup
    ? ["CREA TU CUENTA.", "ELIGE TU PLAN.", "HABLEMOS DE TU META."]
    : null;
  return (
    <div className="auth-page">
      <header className="auth-header">
        <Logo onClick={() => go("/bienvenida")} />
        <button
          className="back-link"
          disabled={busy}
          onClick={() => (step > 0 ? setStep(step - 1) : go("/bienvenida"))}
        >
          <ArrowLeft size={17} /> Volver
        </button>
      </header>
      <main id="main-content" tabIndex={-1} className="auth-main">
        <section className="auth-card">
          <div className="eyebrow">
            {recovery || reset
              ? "VOLVAMOS A CONECTAR"
              : signup
                ? "TU SIGUIENTE CAPÍTULO"
                : "BIENVENIDO DE VUELTA"}
          </div>
          <h1>
            {reset
              ? "UNA NUEVA CONTRASEÑA."
              : recovery
                ? "RECUPERA TU ACCESO."
                : signup
                  ? titles[step]
                  : "SIGAMOS CRECIENDO."}
          </h1>
          <p className="auth-description">
            {recovery
              ? "Te enviaremos un enlace para retomar tu entrenamiento."
              : reset
                ? "Elige una contraseña de al menos 10 caracteres."
                : signup
                  ? [
                      "El primer paso hacia tu próxima gran meta.",
                      "Comienza con el plan gratuito.",
                      "Personaliza tu camino hacia la residencia.",
                    ][step]
                  : "Tu próxima gran conquista empieza con una sesión más."}
          </p>
          {sent ? (
            <div className="recovery-success">
              <div className="empty-icon">
                <Mail />
              </div>
              <h2>{reset ? "Contraseña actualizada" : "Revisa tu correo"}</h2>
              <p>
                {reset
                  ? "Inicia sesión con tu nueva contraseña."
                  : "Si el correo tiene una cuenta, recibirás un enlace para recuperar tu acceso. El enlace dura 30 minutos."}
              </p>
              <Button className="full" onClick={() => go("/login")}>
                Volver a iniciar sesión
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} aria-busy={busy}>
              {(!signup || step === 0) && (
                <>
                  {signup && (
                    <div className="two-fields">
                      <Field
                        label="Nombre"
                        name="name"
                        autoComplete="given-name"
                        value={form.name}
                        onChange={change}
                        required
                        maxLength={60}
                      />
                      <Field
                        label="Apellidos"
                        name="lastname"
                        autoComplete="family-name"
                        value={form.lastname}
                        onChange={change}
                        maxLength={60}
                      />
                    </div>
                  )}
                  {!reset && (
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
                      maxLength={254}
                    />
                  )}
                  {!recovery && (
                    <Password
                      label={
                        signup || reset ? "Crea una contraseña" : "Contraseña"
                      }
                      name="password"
                      autoComplete={
                        signup || reset ? "new-password" : "current-password"
                      }
                      placeholder={
                        signup || reset
                          ? "Al menos 10 caracteres"
                          : "Tu contraseña"
                      }
                      value={form.password}
                      onChange={change}
                      minLength={signup || reset ? 10 : 1}
                      maxLength={128}
                      required
                    />
                  )}
                  {reset && (
                    <Password
                      label="Confirma tu contraseña"
                      name="confirmation"
                      autoComplete="new-password"
                      value={form.confirmation}
                      onChange={change}
                      minLength={10}
                      maxLength={128}
                      required
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
                </>
              )}
              {signup && step === 1 && (
                <div className="signup-plans">
                  {["Básico", "Premium"].map((plan, i) => (
                    <button
                      type="button"
                      disabled={!!i}
                      key={plan}
                      className={`signup-plan ${i ? "" : "selected"}`}
                    >
                      <div>
                        <span className={`radio-dot ${i ? "" : "checked"}`} />
                        <strong>{plan}</strong>
                        {!!i && <Crown size={18} />}
                      </div>
                      <p>
                        {i
                          ? "Más herramientas para tu preparación."
                          : "Quizzes, flashcards y tu mapa de estudio."}
                      </p>
                      <span>
                        {i
                          ? "Próximamente"
                          : "Gratis para comenzar · 10 tokens diarios"}
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
                      {["2026", "2027", "2028", "2029"].map((year) => (
                        <option key={year}>{year}</option>
                      ))}
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
              {error && (
                <p className="error auth-error" role="alert">
                  {error}
                </p>
              )}
              <Button
                className="full"
                type="submit"
                disabled={busy}
                icon="ArrowRight"
              >
                {busy
                  ? "Un momento…"
                  : reset
                    ? "Guardar contraseña"
                    : recovery
                      ? "Enviar enlace"
                      : signup
                        ? step < 2
                          ? "Siguiente"
                          : "Comenzar mi camino"
                        : "Iniciar sesión"}
              </Button>
            </form>
          )}
          {!recovery && !reset && (
            <div className="auth-alternative">
              {signup ? "¿Ya eres parte?" : "¿Es tu primera vez?"}{" "}
              <button
                disabled={busy}
                onClick={() => go(signup ? "/login" : "/registro")}
              >
                {signup ? "Iniciar sesión" : "Crea tu cuenta"}
              </button>
            </div>
          )}
          <p className="auth-disclaimer">
            <ShieldCheck size={15} /> Tu cuenta y tu progreso se guardan de
            forma privada.
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

function Dashboard({
  profile,
  history,
  completed,
  go,
  openModal,
  stats,
  activeSession,
}) {
  const avg =
    stats.recentAverage === null ? "—" : stats.recentAverage.toFixed(1);
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
      {activeSession && (
        <div className="panel resume-banner">
          <div>
            <strong>Tienes un entrenamiento pendiente</strong>
            <p>
              {activeSession.title} · {activeSession.total} preguntas
            </p>
          </div>
          <Button icon="ArrowRight" onClick={() => go("/actividad")}>
            Continuar entrenamiento
          </Button>
        </div>
      )}
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
                <BookOpen size={14} /> Hasta 20 preguntas
              </span>
              <span>
                <Zap size={14} /> Sin costo de tokens
              </span>
            </div>
            <Button
              icon="ArrowRight"
              onClick={() => openModal({ type: "mission", day })}
            >
              Comenzar misión
            </Button>
            <span className="mission-footnote">
              El tamaño se ajusta al banco disponible.
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
            {stats.streak} <span>días de racha</span>
          </div>
          <p>El hábito hace la diferencia.</p>
          <div className="week-streak">
            {stats.weekDays.map((d, i) => (
              <div key={i}>
                <span>{d.label}</span>
                <i
                  className={`${d.today ? "today" : ""} ${d.studied ? "studied" : "rest"}`}
                >
                  {d.studied ? (
                    <Check size={14} />
                  ) : d.today ? (
                    <Flame size={16} />
                  ) : (
                    "·"
                  )}
                </i>
              </div>
            ))}
          </div>
          <small>
            <ShieldCheck size={13} /> Completa un entrenamiento para sumar un
            día.
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
            <ArrowUpRight size={14} /> Últimas 280
          </span>
        </div>
        <div className="metric-card">
          <span className="icon-tile purple">
            <CheckCheck />
          </span>
          <div>
            <span>Preguntas calificadas</span>
            <strong>
              {stats.total}
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

function QuizSetup({ mode, marked, start, go, catalog }) {
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
      catalog.topics
        .filter((q) => !selected.length || selected.includes(q.area))
        .map((q) => q.name),
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
                    <Zap size={12} /> Hasta {n / 5} tokens
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
                      No hay temas disponibles con ese nombre.
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
                    ? "Repasa los errores de tus quizzes. Revela la respuesta y evalúa lo que recuerdas; no modifica tu promedio."
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
              <strong>Tu sesión real.</strong> Hay {catalog.total} preguntas en
              el banco. La sesión se ajusta a las preguntas disponibles para tu
              selección.
            </p>
          </div>
          <Button
            className="full"
            icon="ArrowRight"
            disabled={
              (isCustom && !selected.length) || (isCards && !marked.length)
            }
            onClick={() => start(mode, selected, null, topics, count)}
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
  patchSession,
  reveal,
  rate,
  busy,
  marked,
  toggleMark,
  finish,
  openModal,
}) {
  const q = session.questions[session.current];
  const isCards = ["flashcards", "inteligente"].includes(session.mode);
  const revealed = q.answer !== undefined;
  const title = session.title;
  const selected = session.answers[q.id];
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
          disabled={busy}
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
                disabled={busy}
                onClick={() => reveal(q.id)}
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
                disabled={busy}
                onClick={() => patchSession({ answers: { [q.id]: i } })}
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
                  disabled={busy || session.ratedIds.includes(q.id)}
                  onClick={() => rate(q.id, r.name)}
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
            onClick={() => patchSession({ current: session.current - 1 })}
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
              onClick={() => patchSession({ current: session.current + 1 })}
            >
              Siguiente
            </Button>
          )}
        </div>
      )}
      {isCards && session.ratedIds.length === session.total && (
        <Button onClick={finish}>Terminar repaso</Button>
      )}
      <div className="runner-note">
        <ShieldCheck size={14} />{" "}
        {q.sample
          ? "Pregunta de prueba: contenido pendiente de validación."
          : "Tus respuestas se guardan automáticamente."}
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

function Roadmap({ completed, streak, openModal }) {
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
            <Flame size={20} /> {streak} días de racha
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

function Stats({ initialStats, notify }) {
  const [period, setPeriod] = useState("week");
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    api
      .stats(period)
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((error) => {
        if (active) setError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [period]);
  const points = stats.chart.map((day, i) => ({
    ...day,
    x: 50 + (i * 600) / (stats.chart.length - 1),
    y: 210 - (day.average || 0) * 18,
  }));
  const segments = [];
  let segment = [];
  points.forEach((point) => {
    if (point.average === null) {
      if (segment.length) segments.push(segment);
      segment = [];
    } else segment.push(point);
  });
  if (segment.length) segments.push(segment);
  return (
    <>
      <PageTitle
        eyebrow="EL PROGRESO TAMBIÉN SE PUEDE VER"
        title="Tu esfuerzo, en perspectiva."
        subtitle="Resultados de los quizzes que has completado."
      />
      <div className="metric-grid">
        {[
          {
            label: "Promedio general",
            value: stats.average === null ? "—" : stats.average.toFixed(1),
            unit: "/ 10",
            icon: "Target",
            color: "cyan",
          },
          {
            label: "Preguntas calificadas",
            value: stats.total,
            unit: "preguntas",
            icon: "CheckCheck",
            color: "purple",
          },
          {
            label: "Días de racha",
            value: stats.streak,
            unit: "días",
            icon: "Flame",
            color: "pink",
          },
        ].map((item) => (
          <div className="metric-card" key={item.label}>
            <span className={`icon-tile ${item.color}`}>
              <Icon name={item.icon} />
            </span>
            <div>
              <span>{item.label}</span>
              <strong>
                {item.value}
                <small> {item.unit}</small>
              </strong>
            </div>
          </div>
        ))}
      </div>
      <section className="panel progress-chart" aria-busy={loading}>
        <div className="section-heading">
          <div>
            <span className="eyebrow">TU CONSTANCIA, DÍA A DÍA</span>
            <h2>Evolución del promedio</h2>
          </div>
          <div className="filter-tabs">
            <button
              className={period === "week" ? "active" : ""}
              onClick={() => setPeriod("week")}
            >
              Esta semana
            </button>
            <button
              className={period === "month" ? "active" : ""}
              onClick={() => setPeriod("month")}
            >
              Últimas 4 semanas
            </button>
          </div>
        </div>
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : loading ? (
          <p className="muted">Actualizando tu gráfica…</p>
        ) : (
          <>
            <svg
              viewBox="0 0 700 250"
              role="img"
              aria-label="Promedio de quizzes completados por periodo"
              className="real-stats-chart"
            >
              {[0, 5, 10].map((n) => (
                <g key={n}>
                  <line
                    x1="40"
                    x2="670"
                    y1={210 - n * 18}
                    y2={210 - n * 18}
                    stroke="#ffffff12"
                  />
                  <text x="12" y={215 - n * 18} fill="#a89bbf" fontSize="12">
                    {n}
                  </text>
                </g>
              ))}
              {segments.map((group, i) => (
                <polyline
                  key={i}
                  fill="none"
                  stroke="#a2ee39"
                  strokeWidth="3"
                  points={group.map((p) => `${p.x},${p.y}`).join(" ")}
                />
              ))}
              {points.map((p) => (
                <g key={p.day}>
                  {p.average !== null && (
                    <>
                      <circle cx={p.x} cy={p.y} r="5" fill="#a2ee39" />
                      <text
                        x={p.x}
                        y={p.y - 12}
                        textAnchor="middle"
                        fill="#fff"
                        fontSize="12"
                      >
                        {p.average.toFixed(1)}
                      </text>
                    </>
                  )}
                  <text
                    x={p.x}
                    y="240"
                    textAnchor="middle"
                    fill="#a89bbf"
                    fontSize="12"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
            {!points.some((p) => p.average !== null) && (
              <p className="muted">
                Completa tu primer quiz para ver tu evolución.
              </p>
            )}
          </>
        )}
      </section>
      <div className="stats-summary-grid">
        <section className="panel">
          <h2>Así vas en cada área</h2>
          <div className="area-stats-list">
            {stats.areaStats.map((area) => (
              <div className="real-area-stat" key={area.name}>
                <div>
                  <span className={`icon-tile ${area.color}`}>
                    <Icon name={area.icon} />
                  </span>
                  <strong>{area.name}</strong>
                  <span>
                    {area.score === null ? "Sin intentos" : `${area.score}%`}
                  </span>
                </div>
                <Progress value={area.score || 0} color={area.color} />
                <small className="muted">
                  {area.correct} aciertos de {area.total} preguntas
                </small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <span className="icon-tile cyan">
            <BookOpen />
          </span>
          <h2>Tu recorrido por el banco</h2>
          <p>
            Has practicado {stats.unique} preguntas distintas de{" "}
            {stats.bankTotal} disponibles.
          </p>
          <Progress value={stats.exposure} />
          <div className="modal-metrics">
            <div>
              <strong>{stats.correct}</strong>
              <span>Aciertos</span>
            </div>
            <div>
              <strong>{stats.incorrect}</strong>
              <span>Errores y sin responder</span>
            </div>
          </div>
          <p className="muted">
            {stats.bestArea
              ? `Tu mejor resultado: ${stats.bestArea.name}.`
              : "Tu siguiente entrenamiento abrirá el camino."}
          </p>
        </section>
      </div>
    </>
  );
}

function HistoryPage({ history, go, openModal }) {
  const [filter, setFilter] = useState("Todas");
  const all = history;
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
            onClick={() => go(`/resultados/${h.id}`)}
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

function Plans({ profile }) {
  return (
    <>
      <PageTitle
        eyebrow="UNA META. DISTINTAS FORMAS DE LLEGAR."
        title={
          <>
            Dale espacio a <span className="text-pink">tu potencial.</span>
          </>
        }
        subtitle="Tu cuenta incluye el plan Básico. Premium estará disponible más adelante."
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
            <Button secondary={!i} className="full" disabled>
              {profile.plan === p ? "Tu plan actual" : "Próximamente"}
            </Button>
          </section>
        ))}
      </div>
      <p className="plans-note">
        <ShieldCheck size={16} /> La contratación de Premium todavía no está
        habilitada.
      </p>
    </>
  );
}

function SettingsPage({ profile, saved, updateProfile, go }) {
  const [form, setForm] = useState(profile);
  const [reminders, setReminders] = useState(
    saved.preferences.reminders ?? true,
  );
  const [sound, setSound] = useState(saved.preferences.sound ?? false);
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
          updateProfile({
            name: form.name,
            lastname: form.lastname,
            specialty: form.specialty,
            target: form.target,
            preferences: { reminders, sound },
          });
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
            label="Correo de tu cuenta"
            name="email"
            type="email"
            value={form.email}
            readOnly
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
              {[...new Set(["2026", "2027", "2028", "2029", form.target])].map(
                (y) => (
                  <option key={y}>{y}</option>
                ),
              )}
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
            Tus preferencias se guardan en tu cuenta. Los avisos automáticos y
            sonidos se habilitarán más adelante.
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
              a: "Tu promedio actual usa las últimas 280 preguntas calificadas. Las estadísticas generales incluyen todos tus quizzes completados. Las tarjetas no cambian tu calificación y las preguntas sin responder cuentan como errores.",
            },
            {
              q: "¿Para qué sirven los tokens?",
              a: "Tienes 10 tokens por día, renovados según la fecha de Ciudad de México. Una actividad consume un token por cada cinco preguntas o tarjetas, redondeando hacia arriba. Las misiones son gratuitas y otorgan Tokens+ al completarlas por primera vez.",
            },
            {
              q: "¿Qué es ENARMapa?",
              a: "Es tu ruta de estudio semanal. Empieza con diagnósticos por área y termina con un repaso semanal. Completar una misión desbloquea la siguiente.",
            },
            {
              q: "¿Dónde se guarda mi información?",
              a: "Tu información se guarda en la base de datos del servidor, asociada a tu cuenta. Las contraseñas se guardan mediante hashes y las sesiones se mantienen con cookies privadas. Cada cuenta tiene su propio historial y progreso.",
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

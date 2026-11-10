import { useEffect, useState, type ComponentType } from "react";
import type { Settings } from "./components/Shared";
import { levels, type QuizLevel, type Step } from "./data/relatives";
import { usePersisted } from "./hooks/usePersisted";
import { stopSpeaking } from "./lib/speech";
import type { GameId } from "./lib/games";
import { DoorPage } from "./pages/DoorPage";
import type { GameProps } from "./pages/games";
import { HomePage } from "./pages/HomePage";
import { MatchPage } from "./pages/MatchPage";
import { QuizHome, QuizPlay } from "./pages/QuizPage";
import { isStep } from "./lib/train";
import { RowsPage } from "./pages/RowsPage";
import { SidesPage } from "./pages/SidesPage";
import { TrainPage } from "./pages/TrainPage";
import { TreePage } from "./pages/TreePage";

type Route =
  | { page: "home" }
  | { page: "tree"; id?: string }
  | { page: "train"; steps: Step[] }
  | { page: "quiz" }
  | { page: "play"; level: QuizLevel }
  | { page: "game"; game: GameId };

const games: Record<GameId, ComponentType<GameProps>> = { door: DoorPage, rows: RowsPage, sides: SidesPage, match: MatchPage };
const isGame = (value: string): value is GameId => Object.prototype.hasOwnProperty.call(games, value);

function parseRoute(hash: string): Route {
  const [, page, rawParam] = hash.replace(/^#/, "").split("/");
  const param = rawParam ? decodeURIComponent(rawParam) : undefined;
  if (page === "tree") return { page: "tree", id: param };
  if (page === "train") return { page: "train", steps: (param?.split(",") ?? []).filter(isStep) };
  if (page === "quiz") {
    const level = levels.find((item) => String(item.level) === param);
    return level ? { page: "play", level: level.level } : { page: "quiz" };
  }
  if (page && isGame(page)) return { page: "game", game: page };
  return { page: "home" };
}

export type Stars = Partial<Record<QuizLevel, number>>;
/** 每个小游戏最好的一次拿了几颗星。 */
export type Best = Partial<Record<GameId, number>>;

function App() {
  const [sound, setSound] = usePersisted("ftp:sound", true);
  const [met, setMet] = usePersisted<string[]>("ftp:met", []);
  const [stars, setStars] = usePersisted<Stars>("ftp:stars", {});
  const [best, setBest] = usePersisted<Best>("ftp:best", {});
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  const [round, setRound] = useState(0);

  useEffect(() => {
    const onHash = () => setRoute(parseRoute(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    stopSpeaking();
    window.scrollTo(0, 0);
  }, [route]);

  const settings: Settings = { sound, setSound: (on) => { if (!on) stopSpeaking(); setSound(on); } };
  const go = (hash: string) => { window.location.hash = hash; };
  const goHome = () => go("#/");
  const meet = (id: string) => setMet((list) => (list.includes(id) ? list : [...list, id]));
  const openTree = (id?: string) => go(id ? `#/tree/${id}` : "#/tree");
  const openTrain = (steps: readonly Step[] = []) => go(steps.length ? `#/train/${steps.join(",")}` : "#/train");

  if (route.page === "tree") {
    return <TreePage key={route.id ?? "me"} initialId={route.id} settings={settings} met={met} onMeet={meet}
      onBack={goHome} onTrain={openTrain} />;
  }
  if (route.page === "train") {
    return <TrainPage key={route.steps.join(",")} initialSteps={route.steps} settings={settings}
      onBack={goHome} onTree={openTree} />;
  }
  if (route.page === "quiz") {
    return <QuizHome settings={settings} stars={stars} onBack={goHome} onPlay={(level) => go(`#/quiz/${level}`)} />;
  }
  if (route.page === "play") {
    return (
      <QuizPlay key={`${route.level}-${round}`} level={route.level} settings={settings}
        onBack={() => go("#/quiz")} onAgain={() => setRound(round + 1)} onNext={(level) => go(`#/quiz/${level}`)}
        onTree={openTree}
        onFinish={(level, count) => setStars((prev) => ({ ...prev, [level]: Math.max(prev[level] ?? 0, count) }))} />
    );
  }
  if (route.page === "game") {
    const { game } = route;
    const Game = games[game];
    return <Game key={game} settings={settings} onBack={goHome} onTree={openTree}
      onFinish={(count) => setBest((prev) => ({ ...prev, [game]: Math.max(prev[game] ?? 0, count) }))} />;
  }
  return <HomePage met={met} stars={stars} best={best} onTree={() => openTree()} onTrain={() => openTrain()} onGo={go} />;
}

export default App;

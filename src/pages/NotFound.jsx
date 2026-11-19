import { Link } from "react-router";
import { useI18n } from "../i18n/I18nContext.jsx";
import { Empty } from "../components/States.jsx";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="page narrow">
      <Empty icon="🧭" title={t("notFound.title")} text={t("notFound.text")}>
        <Link to="/" className="btn btn-primary">{t("notFound.home")}</Link>
      </Empty>
    </div>
  );
}

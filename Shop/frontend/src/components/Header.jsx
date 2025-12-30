import { NavLink } from "react-router-dom";
import "../styles/ui.css";

export default function Header() {
  const linkClass = ({ isActive }) =>
    isActive ? "ui-link ui-link-active" : "ui-link";

  return (
    <div className="ui-headerbar">
      <div className="ui-brand">Ebook</div>

      <NavLink to="/" className={linkClass}>
        전자책
      </NavLink>

      <NavLink to="/cart" className={linkClass}>
        장바구니
      </NavLink>
    </div>
  );
}

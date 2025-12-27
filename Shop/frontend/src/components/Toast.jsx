export default function Toast({ message }) {
  if (!message) return null;
  return <div className="ui-toast">{message}</div>;
}

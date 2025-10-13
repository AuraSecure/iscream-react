import ManageEvents from "../ManageEvents";

export default function ManageEventsPage() {
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Manage Events</h2>
      <div className="bg-gray-100 p-6 rounded-lg shadow-md">
        <ManageEvents />
      </div>
    </section>
  );
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SearchForm } from '../components/search-form';
import SearchStats from '../components/search-stats';
export const SearchPage = () => {
    return (_jsx("div", { className: "container mx-auto px-4 py-4", children: _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl md:text-3xl font-bold mb-1 mt-6 pt-2 bg-transparent", style: { zIndex: 2 }, children: "Find Award Flights" }), _jsx("p", { className: "text-default-500 bg-transparent", children: "Search for award flights using points and miles across multiple airlines." })] }), _jsx(SearchForm, {}), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4", children: [_jsx("div", { className: "lg:col-span-2" }), _jsx("div", { className: "lg:col-span-1", children: _jsx(SearchStats, {}) })] })] }) }));
};
export default SearchPage;

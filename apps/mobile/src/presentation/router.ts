import { useLocation, useNavigate } from 'react-router-dom';

/**
 * Shim tipis: halaman lama memakai API useHistory dari react-router v5.
 * react-router-dom v6 hanya punya useNavigate. Satu tempat ini menjaga
 * 12 halaman tetap memakai `history.push`/`replace`/`goBack` yang sudah familiar.
 * ponytail: hapus shim ini kalau halaman sudah dimigrasi ke useNavigate langsung.
 */
export const useHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    location,
    push: (to: string) => navigate(to),
    replace: (to: string) => navigate(to, { replace: true }),
    goBack: () => navigate(-1),
  };
};

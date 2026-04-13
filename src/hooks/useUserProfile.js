import { useCallback, useEffect, useState } from "react";
import { getCurrentUser, getUserTopItems } from "../services/spotifyApi";

export default function useUserProfile(token) {
  const [profile, setProfile] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const [userRes, tracksRes, artistsRes] = await Promise.all([
        getCurrentUser(),
        getUserTopItems("tracks", "short_term", 10),
        getUserTopItems("artists", "short_term", 10),
      ]);

      setProfile({
        displayName: userRes.data.display_name,
        imageUrl: userRes.data.images?.[0]?.url || null,
        country: userRes.data.country,
        product: userRes.data.product,
      });
      setTopTracks(tracksRes.data.items || []);
      setTopArtists(artistsRes.data.items || []);
    } catch {
      // 401 handled by interceptor; other errors silently ignored for profile
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchProfile();
  }, [token, fetchProfile]);

  return { profile, topTracks, topArtists, loadingProfile };
}

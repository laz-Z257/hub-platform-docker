--
-- PostgreSQL database dump
--

\restrict uTcYdopfpE1pJA6RHyUe86ecR9FeN9fwjIhdZb1buptStaivB0GXGejBu6rPygf

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: ratings; Type: TABLE DATA; Schema: public; Owner: hub_admin
--

COPY public.ratings (id, incident_id, user_id, puntuacion, comentario, created_at) FROM stdin;
2ba1c6b2-0849-4176-a6f1-15f28b73d52b	a63c15ce-5a86-41d5-9b9a-6bf15ff22f7a	2f8af890-db23-4cab-8481-d4f94b20b8d6	3	\N	2026-07-23 13:51:56.98738
dee4ad78-11e3-4348-a3d3-cfccdcbf972f	eb6432e1-d09d-4285-bf96-58bd9d6d8193	afa625eb-d2c3-4485-aa94-11bed7fc6665	5	\N	2026-07-27 14:51:13.253666
17b8e38e-c296-4f77-8be7-51ef55aa1853	07b1e38a-1904-4aae-b92e-89d99ff7cf45	afa625eb-d2c3-4485-aa94-11bed7fc6665	3	\N	2026-07-27 16:29:32.370527
002c2486-76e0-4322-bdf9-b2bb469ed902	0569b501-f299-4b6f-8a01-b51f1d39e640	afa625eb-d2c3-4485-aa94-11bed7fc6665	3	\N	2026-07-30 17:10:09.801804
0a966849-e3bb-4f18-9d4a-43a1a4efe4d2	e05b7981-cc19-4bcf-9671-212b42c86dcb	afa625eb-d2c3-4485-aa94-11bed7fc6665	1	\N	2026-07-31 13:58:13.589754
da009b9d-fcc1-4b3b-8804-ffc333924d4d	ddcba9fd-e27f-4c20-b5eb-66059cc417c8	b6c7e839-10bd-42ce-8bf8-28a83d3b451d	3	\N	2026-07-31 17:29:02.208097
23c41316-6d8f-490f-a00a-5337d807693a	18f41db3-01ed-4a73-9d18-d785eb2eb011	2f8af890-db23-4cab-8481-d4f94b20b8d6	5	test	2026-08-13 15:03:30.751212
1752af22-7699-4a80-b34e-152bf3059d50	39885023-928d-4230-bf61-b3731b2f5520	252b18a4-c2c1-41c2-93da-c67f06d17a03	4	\N	2026-08-14 19:24:52.051858
09ac6662-9ec9-4732-ba51-ae22a8d78488	d3b4cbec-2aa3-448e-a129-c217fddc7c96	77a44671-4b8d-4289-8a5f-96c4bc0f7e70	2	\N	2026-08-20 20:23:42.995489
fe23c22a-dbe8-43f2-bbf5-93401628955a	877b345d-04b3-479c-bbbd-923ca55df5c0	ff00aeeb-6450-4ece-a353-01c804e9fa18	2	\N	2026-08-20 20:29:19.610558
\.


--
-- PostgreSQL database dump complete
--

\unrestrict uTcYdopfpE1pJA6RHyUe86ecR9FeN9fwjIhdZb1buptStaivB0GXGejBu6rPygf


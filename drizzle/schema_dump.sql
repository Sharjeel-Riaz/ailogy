--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6
-- Dumped by pg_dump version 16.6 (Homebrew)

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
-- Name: role; Type: TYPE; Schema: public; Owner: accounts
--

CREATE TYPE public.role AS ENUM (
    'user',
    'system'
);


ALTER TYPE public.role OWNER TO accounts;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: aiOutput; Type: TABLE; Schema: public; Owner: accounts
--

CREATE TABLE public."aiOutput" (
    id integer NOT NULL,
    "formData" character varying NOT NULL,
    "aiResponse" text,
    "templateSlug" character varying NOT NULL,
    "createdBy" character varying,
    "createdAt" character varying
);


ALTER TABLE public."aiOutput" OWNER TO accounts;

--
-- Name: aiOutput_id_seq; Type: SEQUENCE; Schema: public; Owner: accounts
--

CREATE SEQUENCE public."aiOutput_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."aiOutput_id_seq" OWNER TO accounts;

--
-- Name: aiOutput_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: accounts
--

ALTER SEQUENCE public."aiOutput_id_seq" OWNED BY public."aiOutput".id;


--
-- Name: category; Type: TABLE; Schema: public; Owner: accounts
--

CREATE TABLE public.category (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying
);


ALTER TABLE public.category OWNER TO accounts;

--
-- Name: message; Type: TABLE; Schema: public; Owner: accounts
--

CREATE TABLE public.message (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    role public.role,
    content text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "tutorId" uuid,
    "userId" character varying
);


ALTER TABLE public.message OWNER TO accounts;

--
-- Name: tutor; Type: TABLE; Schema: public; Owner: accounts
--

CREATE TABLE public.tutor (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    "userId" character varying,
    "userName" character varying,
    src character varying,
    name text,
    description text,
    instructions text,
    seed text,
    "createdAt" timestamp without time zone DEFAULT now(),
    "updatedAt" timestamp without time zone DEFAULT now(),
    "categoryId" uuid
);


ALTER TABLE public.tutor OWNER TO accounts;

--
-- Name: userSubscription; Type: TABLE; Schema: public; Owner: accounts
--

CREATE TABLE public."userSubscription" (
    id integer NOT NULL,
    "userId" character varying,
    "stripeCustomerId" character varying NOT NULL,
    "stripeSubscriptionId" character varying NOT NULL,
    "stripePriceId" character varying NOT NULL,
    "stripeCurrentPeriodEnd" timestamp without time zone,
    "stripeStatus" character varying NOT NULL,
    plan character varying,
    credits integer DEFAULT 10000
);


ALTER TABLE public."userSubscription" OWNER TO accounts;

--
-- Name: userSubscription_id_seq; Type: SEQUENCE; Schema: public; Owner: accounts
--

CREATE SEQUENCE public."userSubscription_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."userSubscription_id_seq" OWNER TO accounts;

--
-- Name: userSubscription_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: accounts
--

ALTER SEQUENCE public."userSubscription_id_seq" OWNED BY public."userSubscription".id;


--
-- Name: aiOutput id; Type: DEFAULT; Schema: public; Owner: accounts
--

ALTER TABLE ONLY public."aiOutput" ALTER COLUMN id SET DEFAULT nextval('public."aiOutput_id_seq"'::regclass);


--
-- Name: userSubscription id; Type: DEFAULT; Schema: public; Owner: accounts
--

ALTER TABLE ONLY public."userSubscription" ALTER COLUMN id SET DEFAULT nextval('public."userSubscription_id_seq"'::regclass);


--
-- Name: aiOutput aiOutput_pkey; Type: CONSTRAINT; Schema: public; Owner: accounts
--

ALTER TABLE ONLY public."aiOutput"
    ADD CONSTRAINT "aiOutput_pkey" PRIMARY KEY (id);


--
-- Name: category category_pkey; Type: CONSTRAINT; Schema: public; Owner: accounts
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);


--
-- Name: message message_pkey; Type: CONSTRAINT; Schema: public; Owner: accounts
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT message_pkey PRIMARY KEY (id);


--
-- Name: tutor tutor_pkey; Type: CONSTRAINT; Schema: public; Owner: accounts
--

ALTER TABLE ONLY public.tutor
    ADD CONSTRAINT tutor_pkey PRIMARY KEY (id);


--
-- Name: userSubscription userSubscription_pkey; Type: CONSTRAINT; Schema: public; Owner: accounts
--

ALTER TABLE ONLY public."userSubscription"
    ADD CONSTRAINT "userSubscription_pkey" PRIMARY KEY (id);


--
-- Name: category_idx; Type: INDEX; Schema: public; Owner: accounts
--

CREATE INDEX category_idx ON public.tutor USING btree ("categoryId");


--
-- Name: name_idx; Type: INDEX; Schema: public; Owner: accounts
--

CREATE INDEX name_idx ON public.tutor USING btree (name);


--
-- Name: tutor_idx; Type: INDEX; Schema: public; Owner: accounts
--

CREATE INDEX tutor_idx ON public.message USING btree ("tutorId");


--
-- Name: message message_tutorId_tutor_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: accounts
--

ALTER TABLE ONLY public.message
    ADD CONSTRAINT "message_tutorId_tutor_id_fk" FOREIGN KEY ("tutorId") REFERENCES public.tutor(id) ON DELETE CASCADE;


--
-- Name: tutor tutor_categoryId_category_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: accounts
--

ALTER TABLE ONLY public.tutor
    ADD CONSTRAINT "tutor_categoryId_category_id_fk" FOREIGN KEY ("categoryId") REFERENCES public.category(id);


--
-- PostgreSQL database dump complete
--


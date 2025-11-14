/**
 * Script de test automatisé pour les transitions de page
 * 
 * Usage:
 * 1. Ouvrir la console du navigateur
 * 2. Copier-coller ce script
 * 3. Ou lancer: npm run test:transitions (si configuré)
 * 
 * Le script va:
 * - Tester les transitions avec différents délais entre les clics
 * - Mesurer les temps de réponse
 * - Détecter les délais anormaux
 * - Logger les résultats pour analyse
 */

interface TransitionTestResult {
  testNumber: number;
  delay: number;
  startTime: number;
  transitionStartTime: number | null;
  transitionEndTime: number | null;
  error: string | null;
  success: boolean;
}

class TransitionTester {
  private results: TransitionTestResult[] = [];
  private currentTest = 0;
  private links: HTMLAnchorElement[] = [];
  private isRunning = false;

  constructor() {
    this.findLinks();
  }

  private findLinks(): void {
    // Trouver tous les liens internes du menu
    const menuLinks = document.querySelectorAll('nav a[href^="/"], header a[href^="/"]') as NodeListOf<HTMLAnchorElement>;
    this.links = Array.from(menuLinks).filter(link => {
      const href = link.getAttribute('href');
      return href && href.startsWith('/') && !href.startsWith('/admin');
    });

    if (this.links.length === 0) {
      console.warn('⚠️ Aucun lien trouvé pour les tests');
    } else {
      console.log(`✅ ${this.links.length} liens trouvés pour les tests`);
    }
  }

  /**
   * Mesure le temps entre le clic et le début de la transition
   */
  private measureTransitionStart(): number | null {
    const startTime = performance.now();
    let transitionStartTime: number | null = null;

    // Écouter les événements de transition
    const handleTransitionStart = () => {
      if (!transitionStartTime) {
        transitionStartTime = performance.now();
        const delay = transitionStartTime - startTime;
        console.log(`⏱️ Transition démarrée après ${delay.toFixed(2)}ms`);
      }
    };

    // Écouter les View Transitions
    if ('startViewTransition' in document) {
      const originalStartViewTransition = (document as any).startViewTransition;
      (document as any).startViewTransition = function(callback: () => void) {
        const transitionStart = performance.now();
        const delay = transitionStart - startTime;
        console.log(`🎬 startViewTransition appelé après ${delay.toFixed(2)}ms`);
        transitionStartTime = transitionStart;
        return originalStartViewTransition.call(this, callback);
      };
    }

    // Écouter les changements de page
    const observer = new MutationObserver(() => {
      if (!transitionStartTime) {
        transitionStartTime = performance.now();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Timeout de sécurité
    setTimeout(() => {
      observer.disconnect();
    }, 5000);

    return transitionStartTime;
  }

  /**
   * Lance un test avec un délai spécifique entre les clics
   */
  private async runSingleTest(delay: number, linkIndex: number): Promise<TransitionTestResult> {
    return new Promise((resolve) => {
      const link = this.links[linkIndex % this.links.length];
      if (!link) {
        resolve({
          testNumber: this.currentTest++,
          delay,
          startTime: performance.now(),
          transitionStartTime: null,
          transitionEndTime: null,
          error: 'Aucun lien disponible',
          success: false
        });
        return;
      }

      const startTime = performance.now();
      let transitionStartTime: number | null = null;
      let transitionEndTime: number | null = null;
      let error: string | null = null;

      // Écouter le début de la transition
      const checkTransitionStart = () => {
        if (!transitionStartTime) {
          transitionStartTime = performance.now();
          const responseTime = transitionStartTime - startTime;
          console.log(`✅ Test ${this.currentTest}: Transition démarrée après ${responseTime.toFixed(2)}ms (délai entre clics: ${delay}ms)`);
        }
      };

      // Écouter la fin de la transition (changement de pathname)
      const currentPath = window.location.pathname;
      const checkTransitionEnd = () => {
        if (window.location.pathname !== currentPath && !transitionEndTime) {
          transitionEndTime = performance.now();
          const totalTime = transitionEndTime - startTime;
          console.log(`🏁 Test ${this.currentTest}: Transition terminée en ${totalTime.toFixed(2)}ms`);
        }
      };

      // Écouter les événements
      document.addEventListener('click', checkTransitionStart, { once: true });
      window.addEventListener('popstate', checkTransitionEnd, { once: true });

      // Timeout de sécurité
      const timeout = setTimeout(() => {
        if (!transitionStartTime) {
          error = 'Timeout: transition non démarrée après 3s';
          console.error(`❌ Test ${this.currentTest}: ${error}`);
        }
        resolve({
          testNumber: this.currentTest++,
          delay,
          startTime,
          transitionStartTime,
          transitionEndTime,
          error,
          success: transitionStartTime !== null
        });
      }, 3000);

      // Simuler le clic
      setTimeout(() => {
        try {
          link.click();
          // Vérifier après un court délai
          setTimeout(checkTransitionStart, 50);
        } catch (e) {
          error = `Erreur lors du clic: ${e}`;
          clearTimeout(timeout);
          resolve({
            testNumber: this.currentTest++,
            delay,
            startTime,
            transitionStartTime: null,
            transitionEndTime: null,
            error,
            success: false
          });
        }
      }, delay);
    });
  }

  /**
   * Lance une série de tests avec différents délais
   */
  async runTests(config: {
    delays?: number[];
    iterations?: number;
    linkIndex?: number;
  } = {}): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️ Tests déjà en cours');
      return;
    }

    this.isRunning = true;
    this.results = [];
    this.currentTest = 0;

    const delays = config.delays || [0, 50, 100, 150, 200, 300, 500];
    const iterations = config.iterations || 3;
    const linkIndex = config.linkIndex || 0;

    console.log(`🚀 Démarrage des tests de transitions`);
    console.log(`📊 Configuration: ${iterations} itérations, délais: ${delays.join(', ')}ms`);

    for (let i = 0; i < iterations; i++) {
      console.log(`\n📦 Itération ${i + 1}/${iterations}`);
      
      for (const delay of delays) {
        // Attendre que la page soit prête
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const result = await this.runSingleTest(delay, linkIndex);
        this.results.push(result);
        
        // Attendre un peu avant le prochain test
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    this.isRunning = false;
    this.printResults();
  }

  /**
   * Affiche les résultats des tests
   */
  private printResults(): void {
    console.log('\n📊 ===== RÉSULTATS DES TESTS =====\n');

    const successfulTests = this.results.filter(r => r.success);
    const failedTests = this.results.filter(r => !r.success);

    console.log(`✅ Tests réussis: ${successfulTests.length}/${this.results.length}`);
    console.log(`❌ Tests échoués: ${failedTests.length}/${this.results.length}\n`);

    if (successfulTests.length > 0) {
      const responseTimes = successfulTests
        .map(r => r.transitionStartTime ? r.transitionStartTime - r.startTime : 0)
        .filter(t => t > 0);

      if (responseTimes.length > 0) {
        const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const min = Math.min(...responseTimes);
        const max = Math.max(...responseTimes);

        console.log('⏱️ Temps de réponse (début de transition):');
        console.log(`   Moyenne: ${avg.toFixed(2)}ms`);
        console.log(`   Min: ${min.toFixed(2)}ms`);
        console.log(`   Max: ${max.toFixed(2)}ms\n`);

        // Analyser par délai
        console.log('📈 Analyse par délai entre clics:');
        const delays = [...new Set(this.results.map(r => r.delay))].sort((a, b) => a - b);
        
        delays.forEach(delay => {
          const testsForDelay = successfulTests.filter(r => r.delay === delay);
          if (testsForDelay.length > 0) {
            const times = testsForDelay
              .map(r => r.transitionStartTime ? r.transitionStartTime - r.startTime : 0)
              .filter(t => t > 0);
            
            if (times.length > 0) {
              const avg = times.reduce((a, b) => a + b, 0) / times.length;
              const slowTests = times.filter(t => t > 200).length;
              console.log(`   Délai ${delay}ms: moyenne ${avg.toFixed(2)}ms, ${slowTests} tests lents (>200ms)`);
            }
          }
        });
      }
    }

    if (failedTests.length > 0) {
      console.log('\n❌ Tests échoués:');
      failedTests.forEach(test => {
        console.log(`   Test ${test.testNumber} (délai ${test.delay}ms): ${test.error || 'Inconnu'}`);
      });
    }

    // Détecter les problèmes
    console.log('\n🔍 Analyse des problèmes:');
    const slowTests = successfulTests.filter(r => {
      const time = r.transitionStartTime ? r.transitionStartTime - r.startTime : 0;
      return time > 200;
    });

    if (slowTests.length > 0) {
      console.log(`⚠️ ${slowTests.length} tests avec délai > 200ms détectés`);
      console.log('   Ces tests indiquent un problème de fluidité');
    } else {
      console.log('✅ Aucun problème de fluidité détecté');
    }

    // Exporter les résultats
    console.log('\n💾 Résultats exportables:');
    console.log(JSON.stringify(this.results, null, 2));
  }

  /**
   * Test rapide avec un seul clic
   */
  async quickTest(linkIndex: number = 0): Promise<void> {
    console.log('⚡ Test rapide...');
    await this.runSingleTest(0, linkIndex);
  }
}

// Export pour usage dans le navigateur
if (typeof window !== 'undefined') {
  (window as any).TransitionTester = TransitionTester;
  
  // Créer une instance globale
  (window as any).transitionTester = new TransitionTester();
  
  console.log('✅ TransitionTester chargé !');
  console.log('💡 Usage:');
  console.log('   - transitionTester.quickTest() : test rapide');
  console.log('   - transitionTester.runTests() : série complète de tests');
  console.log('   - transitionTester.runTests({ delays: [0, 100, 200], iterations: 5 }) : tests personnalisés');
}

export default TransitionTester;


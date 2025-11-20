/**
 * Script de test automatisé pour les transitions de page
 * 
 * USAGE DANS LA CONSOLE DU NAVIGATEUR:
 * 1. Ouvrir la console (F12)
 * 2. Copier-coller tout ce fichier
 * 3. Lancer: transitionTester.runTests()
 * 
 * OU utiliser les commandes rapides:
 * - transitionTester.quickTest() : test rapide avec un seul clic
 * - transitionTester.runTests({ delays: [0, 100, 200], iterations: 3 }) : tests personnalisés
 */

(function() {
  'use strict';

  class TransitionTester {
    constructor() {
      this.results = [];
      this.currentTest = 0;
      this.links = [];
      this.isRunning = false;
      this.findLinks();
    }

    findLinks() {
      // Trouver tous les liens internes du menu
      const menuLinks = document.querySelectorAll('nav a[href^="/"], header a[href^="/"]');
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

    async runSingleTest(delay, linkIndex) {
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
        let transitionStartTime = null;
        let transitionEndTime = null;
        let error = null;
        let resolved = false;

        // Écouter le début de la transition via les View Transitions
        const checkTransitionStart = () => {
          if (!transitionStartTime && !resolved) {
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

        // Écouter les changements visuels (curtain, animations)
        const observer = new MutationObserver(() => {
          checkTransitionStart();
        });

        observer.observe(document.body, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['style', 'class']
        });

        // Écouter les événements de transition
        const handleTransitionStart = () => checkTransitionStart();
        document.addEventListener('click', handleTransitionStart, { once: true, capture: true });

        // Timeout de sécurité
        const timeout = setTimeout(() => {
          if (!resolved) {
            resolved = true;
            observer.disconnect();
            document.removeEventListener('click', handleTransitionStart, { capture: true });
            
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
          }
        }, 3000);

        // Simuler le clic après le délai
        setTimeout(() => {
          try {
            // Vérifier si une transition est déjà en cours
            const curtain = document.getElementById('curtain');
            const isTransitioning = curtain && curtain.style.transform !== 'translateY(100%)';
            
            if (isTransitioning) {
              error = 'Une transition est déjà en cours';
              clearTimeout(timeout);
              resolved = true;
              observer.disconnect();
              document.removeEventListener('click', handleTransitionStart, { capture: true });
              resolve({
                testNumber: this.currentTest++,
                delay,
                startTime,
                transitionStartTime: null,
                transitionEndTime: null,
                error,
                success: false
              });
              return;
            }

            link.click();
            
            // Vérifier après un court délai
            setTimeout(() => {
              checkTransitionStart();
              // Si la transition a démarré, résoudre après un délai
              if (transitionStartTime) {
                setTimeout(() => {
                  if (!resolved) {
                    resolved = true;
                    clearTimeout(timeout);
                    observer.disconnect();
                    document.removeEventListener('click', handleTransitionStart, { capture: true });
                    resolve({
                      testNumber: this.currentTest++,
                      delay,
                      startTime,
                      transitionStartTime,
                      transitionEndTime,
                      error,
                      success: true
                    });
                  }
                }, 100);
              }
            }, 50);
          } catch (e) {
            error = `Erreur lors du clic: ${e.message}`;
            clearTimeout(timeout);
            resolved = true;
            observer.disconnect();
            document.removeEventListener('click', handleTransitionStart, { capture: true });
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

    async runTests(config = {}) {
      if (this.isRunning) {
        console.warn('⚠️ Tests déjà en cours');
        return;
      }

      this.isRunning = true;
      this.results = [];
      this.currentTest = 0;
      this.findLinks(); // Recharger les liens au cas où la page a changé

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

    printResults() {
      if (this.results.length === 0) {
        console.log('⚠️ Aucun résultat à afficher');
        return;
      }

      console.log('\n📊 ===== RÉSULTATS DES TESTS =====\n');

      const successfulTests = this.results.filter(r => r.success);
      const failedTests = this.results.filter(r => !r.success);

      console.log(`📈 Total: ${this.results.length} tests`);
      console.log(`✅ Tests réussis: ${successfulTests.length} (${((successfulTests.length / this.results.length) * 100).toFixed(1)}%)`);
      console.log(`❌ Tests échoués: ${failedTests.length} (${((failedTests.length / this.results.length) * 100).toFixed(1)}%)\n`);

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
                const verySlowTests = times.filter(t => t > 500).length;
                console.log(`   Délai ${delay}ms: moyenne ${avg.toFixed(2)}ms, ${slowTests} lents (>200ms), ${verySlowTests} très lents (>500ms)`);
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
        
        // Analyser les patterns
        const slowByDelay = {};
        slowTests.forEach(test => {
          if (!slowByDelay[test.delay]) {
            slowByDelay[test.delay] = 0;
          }
          slowByDelay[test.delay]++;
        });
        
        console.log('   Répartition par délai:');
        Object.keys(slowByDelay).sort((a, b) => a - b).forEach(delay => {
          console.log(`     - Délai ${delay}ms: ${slowByDelay[delay]} tests lents`);
        });
      } else {
        console.log('✅ Aucun problème de fluidité détecté');
      }

      // Exporter les résultats
      console.log('\n💾 Résultats exportables (copier dans un fichier JSON):');
      console.log(JSON.stringify(this.results, null, 2));
    }

    async quickTest(linkIndex = 0) {
      console.log('⚡ Test rapide...');
      this.findLinks();
      
      if (this.links.length === 0) {
        console.error('❌ Aucun lien trouvé. Utilisez transitionTester.findLinks() pour recharger.');
        return null;
      }
      
      if (linkIndex >= this.links.length) {
        console.error(`❌ Index ${linkIndex} invalide. ${this.links.length} liens disponibles (0-${this.links.length - 1})`);
        console.log('Liens disponibles:');
        this.links.forEach((link, i) => {
          console.log(`   ${i}: ${link.getAttribute('href')}`);
        });
        return null;
      }
      
      const result = await this.runSingleTest(0, linkIndex);
      console.log(`\n📊 Résultat: ${result.success ? '✅ Succès' : '❌ Échec'}`);
      if (result.transitionStartTime) {
        const time = result.transitionStartTime - result.startTime;
        console.log(`⏱️ Temps de réponse: ${time.toFixed(2)}ms`);
        if (time > 200) {
          console.log('⚠️ Attention: délai > 200ms détecté');
        } else if (time > 100) {
          console.log('⚠️ Attention: délai > 100ms détecté');
        } else {
          console.log('✅ Temps de réponse excellent (< 100ms)');
        }
      } else if (result.error) {
        console.log(`❌ Erreur: ${result.error}`);
      }
      return result;
    }
  }

  // Système de logging automatique pour les clics manuels
  class ManualClickLogger {
    constructor() {
      this.logs = [];
      this.isEnabled = true;
      this.setup();
    }

    setup() {
      // Intercepter tous les clics sur les liens
      document.addEventListener('click', (e) => {
        if (!this.isEnabled) return;
        
        const link = e.target.closest('a[href^="/"]');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href || href.startsWith('/admin') || href.startsWith('#')) return;
        
        const clickTime = performance.now();
        const linkText = link.textContent?.trim() || href;
        
        // Log du clic
        const log = {
          timestamp: new Date().toISOString(),
          link: href,
          linkText: linkText,
          clickTime: clickTime,
          transitionStartTime: null,
          transitionEndTime: null,
          error: null,
          duration: null
        };
        
        this.logs.push(log);
        const logIndex = this.logs.length - 1;
        
        console.log(`🖱️ Clic manuel détecté: ${linkText} (${href})`);
        
        // Sauvegarder le pathname actuel AVANT la transition
        const currentPath = window.location.pathname;
        
        // Détecter le début de la transition
        const checkStart = () => {
          if (this.logs[logIndex].transitionStartTime) return; // Déjà détecté
          
          // Méthode 1: Vérifier le curtain (Safari/Firefox)
          const curtain = document.getElementById('curtain');
          const isCurtainTransitioning = curtain && curtain.style.transform !== 'translateY(100%)';
          
          // Méthode 2: Vérifier les View Transitions (Chrome)
          const hasViewTransition = document.documentElement.style.viewTransitionName || 
                                   document.querySelector('[style*="view-transition"]');
          
          // Méthode 3: Vérifier les changements de pathname (indique que la navigation a commencé)
          const pathChanged = window.location.pathname !== currentPath;
          
          // Méthode 4: Vérifier les animations CSS actives
          const hasActiveAnimations = document.querySelector('[style*="clip-path"]') ||
                                     document.querySelector('[style*="view-transition"]');
          
          if (isCurtainTransitioning || hasViewTransition || pathChanged || hasActiveAnimations) {
            this.logs[logIndex].transitionStartTime = performance.now();
            const delay = this.logs[logIndex].transitionStartTime - clickTime;
            console.log(`   ⏱️ Transition démarrée après ${delay.toFixed(2)}ms`);
            
            if (delay > 200) {
              console.warn(`   ⚠️ DÉLAI IMPORTANT: ${delay.toFixed(2)}ms (> 200ms)`);
            } else if (delay > 100) {
              console.warn(`   ⚠️ Délai modéré: ${delay.toFixed(2)}ms (> 100ms)`);
            } else {
              console.log(`   ✅ Excellent: ${delay.toFixed(2)}ms (< 100ms)`);
            }
          }
        };
        
        // Vérifier plusieurs fois avec des intervalles plus courts
        setTimeout(checkStart, 5);
        setTimeout(checkStart, 10);
        setTimeout(checkStart, 20);
        setTimeout(checkStart, 50);
        setTimeout(checkStart, 100);
        setTimeout(checkStart, 200);
        
        // Détecter la fin de la transition
        const checkEnd = setInterval(() => {
          if (window.location.pathname !== currentPath) {
            this.logs[logIndex].transitionEndTime = performance.now();
            this.logs[logIndex].duration = this.logs[logIndex].transitionEndTime - clickTime;
            clearInterval(checkEnd);
            console.log(`   ✅ Transition terminée en ${this.logs[logIndex].duration.toFixed(2)}ms`);
            this.printLastLog();
          }
        }, 50);
        
        // Timeout de sécurité
        setTimeout(() => {
          clearInterval(checkEnd);
          if (!this.logs[logIndex].transitionStartTime) {
            this.logs[logIndex].error = 'Transition non détectée après 3s';
            console.warn(`   ❌ ${this.logs[logIndex].error}`);
          }
        }, 3000);
      }, true);
    }

    printLastLog() {
      const lastLog = this.logs[this.logs.length - 1];
      if (!lastLog) return;
      
      console.log('\n📋 === RÉSUMÉ DU CLIC ===');
      console.log(`Lien: ${lastLog.linkText} (${lastLog.link})`);
      
      if (lastLog.transitionStartTime) {
        const delay = lastLog.transitionStartTime - lastLog.clickTime;
        console.log(`Délai avant transition: ${delay.toFixed(2)}ms`);
        
        if (delay > 200) {
          console.log(`⚠️ PROBLÈME: Délai > 200ms (${delay.toFixed(2)}ms)`);
        } else if (delay > 100) {
          console.log(`⚠️ Attention: Délai > 100ms (${delay.toFixed(2)}ms)`);
        } else {
          console.log(`✅ Excellent: Délai < 100ms`);
        }
      } else {
        console.log('❌ Transition non démarrée');
      }
      
      if (lastLog.duration) {
        console.log(`Durée totale: ${lastLog.duration.toFixed(2)}ms`);
      }
      
      if (lastLog.error) {
        console.log(`Erreur: ${lastLog.error}`);
      }
      
      console.log('========================\n');
    }

    getLogs() {
      return this.logs;
    }

    printAllLogs() {
      console.log('\n📊 === TOUS LES CLICS MANUELS ===\n');
      this.logs.forEach((log, i) => {
        console.log(`${i + 1}. ${log.linkText} (${log.link})`);
        if (log.transitionStartTime) {
          const delay = log.transitionStartTime - log.clickTime;
          console.log(`   Délai: ${delay.toFixed(2)}ms ${delay > 200 ? '⚠️ PROBLÈME' : delay > 100 ? '⚠️' : '✅'}`);
        }
        if (log.error) {
          console.log(`   ❌ ${log.error}`);
        }
      });
      console.log('\n========================\n');
    }

    clearLogs() {
      this.logs = [];
      console.log('🗑️ Logs effacés');
    }

    enable() {
      this.isEnabled = true;
      console.log('✅ Logging manuel activé');
    }

    disable() {
      this.isEnabled = false;
      console.log('⏸️ Logging manuel désactivé');
    }

    exportLogs() {
      console.log('\n💾 === EXPORT DES LOGS ===');
      console.log('Copiez ce JSON pour partager:');
      console.log(JSON.stringify(this.logs, null, 2));
      console.log('========================\n');
      return this.logs;
    }
  }

  // Créer une instance globale
  try {
    window.transitionTester = new TransitionTester();
    window.clickLogger = new ManualClickLogger();
    
    console.log('✅ TransitionTester chargé !');
    console.log('✅ ClickLogger activé (capture automatique des clics manuels)');
    console.log('\n💡 Commandes disponibles:');
    console.log('   🚀 RAPIDE:');
    console.log('   - transitionTester.quickTest() : test rapide avec un seul clic');
    console.log('   - transitionTester.quickTest(1) : tester le 2ème lien');
    console.log('\n   📊 COMPLET:');
    console.log('   - transitionTester.runTests() : série complète (3 itérations, 7 délais)');
    console.log('   - transitionTester.runTests({ delays: [0, 100, 200], iterations: 5 }) : personnalisé');
    console.log('\n   🖱️ CLICS MANUELS (automatique):');
    console.log('   - Cliquez sur les liens du menu → les infos sont capturées automatiquement');
    console.log('   - clickLogger.getLogs() : voir tous les clics');
    console.log('   - clickLogger.printAllLogs() : afficher le résumé');
    console.log('   - clickLogger.exportLogs() : exporter en JSON pour partager');
    console.log('   - clickLogger.clearLogs() : effacer les logs');
    console.log('\n   🔍 DEBUG:');
    console.log('   - transitionTester.links : voir les liens trouvés');
    console.log('   - transitionTester.findLinks() : recharger les liens');
    console.log('   - transitionTester.results : voir les résultats');
    console.log('\n💡 Astuce: Cliquez simplement sur les liens du menu, les infos sont capturées automatiquement !');
  } catch (error) {
    console.error('❌ Erreur lors du chargement de TransitionTester:', error);
    console.error('Stack:', error.stack);
  }
})();

